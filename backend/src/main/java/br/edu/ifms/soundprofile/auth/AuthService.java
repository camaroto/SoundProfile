package br.edu.ifms.soundprofile.auth;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import br.edu.ifms.soundprofile.auth.UsuarioRepository.UsuarioParaLogin;
import br.edu.ifms.soundprofile.comum.ErroNegocio;
import br.edu.ifms.soundprofile.comum.Validacao;
import br.edu.ifms.soundprofile.security.UsuarioLogado;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.text.Normalizer;
import java.util.HexFormat;
import java.util.concurrent.ThreadLocalRandom;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

@Service
public class AuthService {

    // Hash de uma senha qualquer: gasta o mesmo tempo quando o usuário não existe,
    // para a resposta não revelar quais contas existem.
    private static final String HASH_FALSO = "$2b$12$xvC9u4CjCZr49LItXwIPZuwNSOVVDzOnVpAsDHh12krUEa9fKVkli";

    private final UsuarioRepository usuarios;
    private final SessaoService sessoes;
    private final VerificacaoService verificacao;
    private final PasswordEncoder codificador;
    private final TransactionTemplate transacao;
    private final GoogleService google;
    private final CadastroGooglePendenteRepository cadastrosGoogle;



public boolean usernameGoogleDisponivel(String token, String usernameBruto) {
    if (token == null || token.length() != 64) {
        throw new ErroNegocio(HttpStatus.UNAUTHORIZED, "Cadastro temporário inválido ou expirado.");
    }

    String tokenHash = hashToken(token);

    if (cadastrosGoogle.buscarValido(tokenHash).isEmpty()) {
        throw new ErroNegocio(HttpStatus.UNAUTHORIZED, "Cadastro temporário inválido ou expirado.");
    }

    String username = Validacao.texto(usernameBruto);

    return Validacao.usernameValido(username)
        && !Validacao.usernameReservado(username)
        && !usuarios.existeUsername(username);
}

public SessaoResposta finalizarCadastroGoogle(String token, String usernameBruto) {
    if (token == null || token.length() != 64) {
        throw new ErroNegocio(HttpStatus.UNAUTHORIZED, "Cadastro temporário inválido ou expirado.");
    }

    String username = Validacao.texto(usernameBruto);

    Map<String, String> erros = new LinkedHashMap<>();

    if (!Validacao.usernameValido(username)) {
        erros.put("username", "Use de 3 a 20 caracteres: letras, números, _ ou ponto.");
    } else if (Validacao.usernameReservado(username)) {
        erros.put("username", "Este nome de usuário não está disponível.");
    }

    if (!erros.isEmpty()) {
        throw new ErroNegocio(
            HttpStatus.BAD_REQUEST,
            "DADOS_INVALIDOS",
            "Confira o nome de usuário.",
            erros
        );
    }

    String tokenHash = hashToken(token);

    return transacao.execute(status -> {
        CadastroGooglePendenteRepository.CadastroPendente cadastro =
            cadastrosGoogle.buscarValido(tokenHash)
                .orElseThrow(() -> new ErroNegocio(
                    HttpStatus.UNAUTHORIZED,
                    "Cadastro temporário inválido ou expirado."
                ));

        if (usuarios.existeUsername(username)) {
            throw new ErroNegocio(
                HttpStatus.CONFLICT,
                "USERNAME_INDISPONIVEL",
                "Este nome de usuário já está em uso.",
                Map.of("username", "Escolha outro nome de usuário.")
            );
        }

        if (usuarios.existeEmail(cadastro.email())) {
            throw new ErroNegocio(
                HttpStatus.CONFLICT,
                "GOOGLE_EMAIL_JA_CADASTRADO",
                "Este e-mail já possui uma conta.",
                Map.of()
            );
        }

        if (!cadastrosGoogle.consumir(tokenHash)) {
            throw new ErroNegocio(
                HttpStatus.UNAUTHORIZED,
                "Cadastro temporário inválido ou expirado."
            );
        }

        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);

        String senhaHash = codificador.encode(HexFormat.of().formatHex(bytes));

        long id = usuarios.criarComGoogle(
            username,
            cadastro.email(),
            senhaHash,
            cadastro.googleId(),
            cadastro.nomeExibicao()
        );

        return abrirSessao(id);
    });
}

    public AuthService(UsuarioRepository usuarios, SessaoService sessoes, VerificacaoService verificacao,
            PasswordEncoder codificador, TransactionTemplate transacao, GoogleService google,
            CadastroGooglePendenteRepository cadastrosGoogle) {
        this.google = google;
        this.usuarios = usuarios;
        this.sessoes = sessoes;
        this.verificacao = verificacao;
        this.codificador = codificador;
        this.transacao = transacao;
        this.cadastrosGoogle = cadastrosGoogle;
    }

    public record SessaoResposta(String token, Instant expiraEm, UsuarioLogado usuario) {
    }

    public record GoogleResposta(
            String tipo,
            SessaoResposta sessao,
            String tokenCadastro,
            Instant expiraEm,
            String email,
            String nomeExibicao) {
    }

    /**
     * RN02: um e-mail por conta. A conta nasce não verificada; só entra depois de
     * confirmar o código.
     */
    public String cadastrar(String usernameBruto, String emailBruto, String senha) {
        String username = Validacao.texto(usernameBruto);
        String email = Validacao.texto(emailBruto).toLowerCase(Locale.ROOT);
        String senhaSegura = senha == null ? "" : senha;

        Map<String, String> erros = Validacao.validarCadastro(username, email, senhaSegura);
        if (!erros.isEmpty())
            throw new ErroNegocio(HttpStatus.BAD_REQUEST, "Corrija os campos destacados.", erros);

        usuarios.liberarPendentes(email, username);

        Map<String, String> duplicados = new LinkedHashMap<>();
        if (usuarios.existeEmail(email))
            duplicados.put("email", "Este e-mail já está em uso.");
        if (usuarios.existeUsername(username))
            duplicados.put("username", "Este nome de usuário já está em uso.");
        if (!duplicados.isEmpty())
            throw new ErroNegocio(HttpStatus.CONFLICT, "Corrija os campos destacados.", duplicados);

        String senhaHash = codificador.encode(senhaSegura);
        Long id;
        try {
            id = transacao.execute(s -> usuarios.criar(username, email, senhaHash, false));
        } catch (DuplicateKeyException e) {
            // Duas pessoas ao mesmo tempo: o índice único do banco decide quem ficou com o
            // nome/e-mail.
            String campo = e.getMessage() != null && e.getMessage().contains("email") ? "email" : "username";
            String msg = campo.equals("email") ? "Este e-mail já está em uso." : "Este nome de usuário já está em uso.";
            throw new ErroNegocio(HttpStatus.CONFLICT, "Corrija os campos destacados.", Map.of(campo, msg));
        }
        if (id == null)
            throw new IllegalStateException("Usuário não foi criado.");

        try {
            verificacao.enviarCodigo(id, username, email);
        } catch (RuntimeException e) {
            // Sem e-mail enviado não há como confirmar a conta: desfaz o cadastro para a
            // pessoa tentar de novo.
            usuarios.excluir(id);
            throw e;
        }
        return email;
    }

    public SessaoResposta entrar(String identificadorBruto, String senhaBruta) {
        String identificador = Validacao.texto(identificadorBruto);
        String senha = senhaBruta == null ? "" : senhaBruta;
        if (identificador.isEmpty() || senha.isEmpty()) {
            throw new ErroNegocio(HttpStatus.BAD_REQUEST, "Informe seu usuário (ou e-mail) e a senha.");
        }

        Optional<UsuarioParaLogin> u = usuarios.buscarParaLogin(identificador);
        // O BCrypt só aceita até 72 bytes: senhas maiores nunca foram aceitas no
        // cadastro.
        boolean cabe = senha.getBytes(StandardCharsets.UTF_8).length <= 72;
        boolean confere = codificador.matches(cabe ? senha : "x",
                u.map(UsuarioParaLogin::senhaHash).orElse(HASH_FALSO));

        // Mesma mensagem para usuário inexistente e senha errada.
        if (u.isEmpty() || !confere || !cabe)
            throw new ErroNegocio(HttpStatus.UNAUTHORIZED, "Usuário ou senha inválidos.");
        UsuarioParaLogin conta = u.get();

        if (!"ativa".equals(conta.status()))
            throw new ErroNegocio(HttpStatus.FORBIDDEN, "Esta conta não está ativa.");

        if (!conta.emailVerificado()) {
            try {
                verificacao.enviarCodigo(conta.idUsuario(), conta.username(), conta.email());
            } catch (ErroNegocio ignorado) {
                // Em intervalo de reenvio ou com falha de envio: a tela do código mostra as
                // opções.
            }
            throw new ErroNegocio(HttpStatus.FORBIDDEN, "EMAIL_NAO_VERIFICADO", "Confirme o seu e-mail para entrar.",
                    Map.of("email", conta.email()));
        }
        return abrirSessao(conta.idUsuario());
    }

    public SessaoResposta verificarEmail(String emailBruto, String codigoBruto) {
        String email = Validacao.texto(emailBruto).toLowerCase(Locale.ROOT);
        String codigo = codigoBruto == null ? "" : codigoBruto.replaceAll("\\D", "");
        if (codigo.length() != 6) {
            throw new ErroNegocio(HttpStatus.BAD_REQUEST, "Digite os 6 números do código.",
                    Map.of("codigo", "Digite os 6 números do código."));
        }
        return abrirSessao(verificacao.confirmarCodigo(email, codigo));
    }

    /**
     * A resposta é a mesma exista ou não conta pendente, para não revelar quais
     * e-mails estão cadastrados.
     */
    public void reenviarCodigo(String emailBruto) {
        String email = Validacao.texto(emailBruto).toLowerCase(Locale.ROOT);
        usuarios.buscarPendentePorEmail(email)
                .ifPresent(p -> verificacao.enviarCodigo(p.idUsuario(), p.username(), p.email()));
    }

    /**
     * Entra (ou cria a conta) com o Google. Se o e-mail do Google já tem conta no
     * site, as contas são ligadas:
     * o Google confirmou que a pessoa é dona do e-mail.
     */

    public GoogleResposta entrarComGoogle(String code, String redirectUri) {
        if (code == null || code.isBlank() || code.length() > 2000
                || redirectUri == null || redirectUri.length() > 300) {
            throw new ErroNegocio(HttpStatus.BAD_REQUEST, "Requisição inválida.");
        }

        GoogleService.PerfilGoogle g = google.ler(code, redirectUri);

        if (!g.emailVerificado()) {
            throw new ErroNegocio(HttpStatus.FORBIDDEN, "GOOGLE_EMAIL_NAO_VERIFICADO",
                    "O Google informou que o e-mail dessa conta ainda não foi verificado.", Map.of());
        }

        Optional<UsuarioRepository.ContaGoogle> porGoogle = usuarios.buscarPorGoogleId(g.sub());

        if (porGoogle.isPresent()) {
            exigirAtiva(porGoogle.get().status());

            return new GoogleResposta(
                    "SESSAO",
                    abrirSessao(porGoogle.get().idUsuario()),
                    null, null, null, null);
        }

        Optional<UsuarioRepository.ContaGoogle> porEmail = usuarios.buscarPorEmail(g.email());

        if (porEmail.isPresent()) {
            UsuarioRepository.ContaGoogle conta = porEmail.get();
            exigirAtiva(conta.status());

            if (conta.googleId() != null && !conta.googleId().equals(g.sub())) {
                throw new ErroNegocio(HttpStatus.CONFLICT, "GOOGLE_CONTA_DIFERENTE",
                        "Esse e-mail já está ligado a outra conta do Google.", Map.of());
            }

            usuarios.vincularGoogle(conta.idUsuario(), g.sub());

            return new GoogleResposta(
                    "SESSAO",
                    abrirSessao(conta.idUsuario()),
                    null, null, null, null);
        }

        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);

        String token = HexFormat.of().formatHex(bytes);
        String tokenHash = hashToken(token);

        String nome = g.nome().length() > 40
                ? g.nome().substring(0, 40)
                : g.nome();

        Instant expiraEm = Instant.now().plusSeconds(600);

        cadastrosGoogle.excluirExpirados();

        cadastrosGoogle.salvar(
                tokenHash,
                g.sub(),
                g.email(),
                nome.isBlank() ? null : nome,
                expiraEm);

        return new GoogleResposta(
                "CADASTRO_PENDENTE",
                null,
                token,
                expiraEm,
                g.email(),
                nome);
    }

    private static String hashToken(String token) {
    try {
        byte[] hash = MessageDigest.getInstance("SHA-256")
            .digest(token.getBytes(StandardCharsets.UTF_8));

        return HexFormat.of().formatHex(hash);
    } catch (NoSuchAlgorithmException e) {
        throw new IllegalStateException("SHA-256 não está disponível.", e);
    }
}

    private static void exigirAtiva(String status) {
        if (!"ativa".equals(status))
            throw new ErroNegocio(HttpStatus.FORBIDDEN, "Esta conta não está ativa.");
    }

    /** Gera um username válido e livre a partir do nome ou do e-mail do Google. */
    private String usernameLivre(String nome, String email) {
        String origem = nome.isBlank() ? email.substring(0, email.indexOf('@')) : nome;
        String fonte = Normalizer.normalize(origem, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9_.]+", "");
        if (fonte.length() > 14)
            fonte = fonte.substring(0, 14);
        String base = fonte.length() >= 3 ? fonte : ("user" + fonte);
        if (Validacao.usernameReservado(base))
            base = base + ThreadLocalRandom.current().nextInt(10, 99);

        for (int i = 0; i < 20; i++) {
            String candidato = i == 0 ? base : base + ThreadLocalRandom.current().nextInt(100, 100_000);
            if (candidato.length() > 20)
                candidato = candidato.substring(0, 20);
            if (Validacao.usernameValido(candidato) && !Validacao.usernameReservado(candidato)
                    && !usuarios.existeUsername(candidato)) {
                return candidato;
            }
        }
        throw new IllegalStateException("Não foi possível gerar um nome de usuário livre.");
    }

    public void sair(String token) {
        sessoes.encerrar(token);
    }

    private SessaoResposta abrirSessao(long idUsuario) {
        UsuarioLogado resumo = usuarios.buscarResumo(idUsuario)
                .orElseThrow(() -> new ErroNegocio(HttpStatus.UNAUTHORIZED, "Conta não encontrada."));
        SessaoService.NovaSessao sessao = sessoes.criar(idUsuario);
        return new SessaoResposta(sessao.token(), sessao.expiraEm(), resumo);
    }
}
