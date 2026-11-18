package br.edu.ifms.soundprofile.auth;

import br.edu.ifms.soundprofile.comum.ErroNegocio;
import java.io.IOException;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * Confirmação de e-mail por código de 6 dígitos. O código vale 10 minutos, aceita 5 tentativas
 * e só é guardado como hash. Reenvio: no mínimo 60 s entre pedidos e no máximo 5 por hora.
 */
@Service
public class VerificacaoService {

    private static final Logger log = LoggerFactory.getLogger(VerificacaoService.class);

    static final int VALIDADE_MINUTOS = 10;
    static final int MAX_TENTATIVAS = 5;
    static final int INTERVALO_REENVIO_S = 60;
    static final int MAX_ENVIOS_POR_HORA = 5;
    private static final String ERRO_GENERICO = "Código inválido ou expirado. Peça um novo código.";

    private final JdbcClient jdbc;
    private final EmailService email;
    private final TransactionTemplate transacao;
    private final BCryptPasswordEncoder codificador = new BCryptPasswordEncoder(8);
    private final SecureRandom aleatorio = new SecureRandom();

    public VerificacaoService(JdbcClient jdbc, EmailService email, TransactionTemplate transacao) {
        this.jdbc = jdbc;
        this.email = email;
        this.transacao = transacao;
    }

    static String formatarCodigo(int numero) {
        return String.format("%06d", numero);
    }

    private record Historico(OffsetDateTime ultimo, int ultimaHora) {
    }

    /** Gera um código novo (o anterior deixa de valer) e envia por e-mail. */
    public void enviarCodigo(long idUsuario, String username, String destino) {
        Historico h = jdbc.sql("""
                SELECT MAX(enviadoem) AS ultimo,
                       COUNT(*) FILTER (WHERE enviadoem > now() - interval '1 hour') AS ultima_hora
                  FROM enviocodigo WHERE idusuario = :id
                """)
            .param("id", idUsuario)
            .query((rs, n) -> new Historico(rs.getObject("ultimo", OffsetDateTime.class), rs.getInt("ultima_hora")))
            .single();

        if (h.ultimo() != null) {
            long passou = java.time.Duration.between(h.ultimo(), OffsetDateTime.now()).toSeconds();
            long espera = INTERVALO_REENVIO_S - passou;
            if (espera > 0) {
                throw new ErroNegocio(HttpStatus.TOO_MANY_REQUESTS, "Aguarde " + espera + " s para pedir um novo código.");
            }
        }
        if (h.ultimaHora() >= MAX_ENVIOS_POR_HORA) {
            throw new ErroNegocio(HttpStatus.TOO_MANY_REQUESTS, "Você pediu códigos demais. Tente novamente daqui a pouco.");
        }

        String codigo = formatarCodigo(aleatorio.nextInt(1_000_000));
        String hash = codificador.encode(codigo);
        transacao.executeWithoutResult(s -> {
            jdbc.sql("""
                    INSERT INTO codigoverificacao (idusuario, codigohash, expiraem, tentativas)
                    VALUES (:id, :hash, now() + make_interval(mins => :min), 0)
                    ON CONFLICT (idusuario) DO UPDATE
                      SET codigohash = EXCLUDED.codigohash, expiraem = EXCLUDED.expiraem, tentativas = 0
                    """)
                .param("id", idUsuario).param("hash", hash).param("min", VALIDADE_MINUTOS).update();
            jdbc.sql("INSERT INTO enviocodigo (idusuario) VALUES (:id)").param("id", idUsuario).update();
        });

        try {
            email.enviar(montarEmail(destino, username, codigo));
        } catch (IOException e) {
            jdbc.sql("DELETE FROM codigoverificacao WHERE idusuario = :id").param("id", idUsuario).update();
            log.error("Falha ao enviar o e-mail de verificação: {}", e.getMessage());
            throw new ErroNegocio(HttpStatus.SERVICE_UNAVAILABLE,
                "Não foi possível enviar o e-mail agora. Tente novamente em instantes.");
        }
    }

    /**
     * Cada tentativa é "reservada" no banco antes de comparar, então várias tentativas
     * simultâneas não conseguem passar do limite. Devolve o id do usuário agora verificado.
     */
    public long confirmarCodigo(String emailConta, String codigo) {
        Optional<Long> conta = jdbc.sql("""
                SELECT idusuario FROM usuario
                 WHERE LOWER(email) = LOWER(:email) AND emailverificado = false AND status = 'ativa'
                """)
            .param("email", emailConta).query(Long.class).optional();
        if (conta.isEmpty()) throw codigoInvalido(ERRO_GENERICO);
        long idUsuario = conta.get();

        record Tentativa(String hash, int tentativas) {
        }
        Optional<Tentativa> t = jdbc.sql("""
                UPDATE codigoverificacao SET tentativas = tentativas + 1
                 WHERE idusuario = :id AND tentativas < :max AND expiraem > now()
                RETURNING codigohash, tentativas
                """)
            .param("id", idUsuario).param("max", MAX_TENTATIVAS)
            .query((rs, n) -> new Tentativa(rs.getString("codigohash"), rs.getInt("tentativas")))
            .optional();
        if (t.isEmpty()) throw codigoInvalido(ERRO_GENERICO);

        if (!codificador.matches(codigo, t.get().hash())) {
            int restantes = MAX_TENTATIVAS - t.get().tentativas();
            throw codigoInvalido(restantes > 0
                ? "Código incorreto. Você ainda tem " + restantes + (restantes == 1 ? " tentativa." : " tentativas.")
                : "Muitas tentativas erradas. Peça um novo código.");
        }

        transacao.executeWithoutResult(s -> {
            jdbc.sql("UPDATE usuario SET emailverificado = true WHERE idusuario = :id").param("id", idUsuario).update();
            jdbc.sql("DELETE FROM codigoverificacao WHERE idusuario = :id").param("id", idUsuario).update();
        });
        return idUsuario;
    }

    private static ErroNegocio codigoInvalido(String mensagem) {
        return new ErroNegocio(HttpStatus.BAD_REQUEST, mensagem, Map.of("codigo", mensagem));
    }

    private static EmailService.Mensagem montarEmail(String para, String username, String codigo) {
        String texto = "Olá, " + username + "!\n\nSeu código de verificação do SoundProfile é: " + codigo + "\n\n"
            + "Ele vale por " + VALIDADE_MINUTOS + " minutos. Se não foi você que criou a conta, ignore esta mensagem.";
        // O username só tem letras, números, _ e ponto, então é seguro dentro do HTML.
        String html = "<!doctype html><html><body style=\"margin:0;background:#0b0912;padding:24px;font-family:Arial,sans-serif;\">"
            + "<div style=\"max-width:420px;margin:0 auto;background:#14121c;border:1px solid #2e1065;border-radius:16px;padding:28px;color:#e9e7f2;\">"
            + "<p style=\"margin:0 0 4px;font-size:13px;letter-spacing:.08em;color:#a78bfa;font-weight:bold;\">SOUNDPROFILE</p>"
            + "<h1 style=\"margin:0 0 16px;font-size:20px;color:#fff;\">Confirme o seu e-mail</h1>"
            + "<p style=\"margin:0 0 20px;font-size:15px;line-height:22px;\">Olá, " + username + "! Use o código abaixo para ativar a sua conta:</p>"
            + "<p style=\"margin:0 0 20px;text-align:center;font-size:34px;letter-spacing:10px;font-weight:bold;color:#fff;background:#1d1830;border-radius:12px;padding:16px 0;\">" + codigo + "</p>"
            + "<p style=\"margin:0;font-size:13px;line-height:20px;color:#9b97ad;\">O código vale por " + VALIDADE_MINUTOS
            + " minutos. Se não foi você que criou a conta, ignore esta mensagem.</p></div></body></html>";
        return new EmailService.Mensagem(para, codigo + " é o seu código do SoundProfile", texto, html);
    }
}
