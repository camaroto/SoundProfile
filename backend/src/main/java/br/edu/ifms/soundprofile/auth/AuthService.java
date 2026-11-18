package br.edu.ifms.soundprofile.auth;

import br.edu.ifms.soundprofile.auth.UsuarioRepository.UsuarioParaLogin;
import br.edu.ifms.soundprofile.comum.ErroNegocio;
import br.edu.ifms.soundprofile.comum.Validacao;
import br.edu.ifms.soundprofile.security.UsuarioLogado;
import java.nio.charset.StandardCharsets;
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

    public AuthService(UsuarioRepository usuarios, SessaoService sessoes, VerificacaoService verificacao,
                       PasswordEncoder codificador, TransactionTemplate transacao) {
        this.usuarios = usuarios;
        this.sessoes = sessoes;
        this.verificacao = verificacao;
        this.codificador = codificador;
        this.transacao = transacao;
    }

    public record SessaoResposta(String token, Instant expiraEm, UsuarioLogado usuario) {
    }

    /** RN02: um e-mail por conta. A conta nasce não verificada; só entra depois de confirmar o código. */
    public String cadastrar(String usernameBruto, String emailBruto, String senha) {
        String username = Validacao.texto(usernameBruto);
        String email = Validacao.texto(emailBruto).toLowerCase(Locale.ROOT);
        String senhaSegura = senha == null ? "" : senha;

        Map<String, String> erros = Validacao.validarCadastro(username, email, senhaSegura);
        if (!erros.isEmpty()) throw new ErroNegocio(HttpStatus.BAD_REQUEST, "Corrija os campos destacados.", erros);

        usuarios.liberarPendentes(email, username);

        Map<String, String> duplicados = new LinkedHashMap<>();
        if (usuarios.existeEmail(email)) duplicados.put("email", "Este e-mail já está em uso.");
        if (usuarios.existeUsername(username)) duplicados.put("username", "Este nome de usuário já está em uso.");
        if (!duplicados.isEmpty()) throw new ErroNegocio(HttpStatus.CONFLICT, "Corrija os campos destacados.", duplicados);

        String senhaHash = codificador.encode(senhaSegura);
        Long id;
        try {
            id = transacao.execute(s -> usuarios.criar(username, email, senhaHash, false));
        } catch (DuplicateKeyException e) {
            // Duas pessoas ao mesmo tempo: o índice único do banco decide quem ficou com o nome/e-mail.
            String campo = e.getMessage() != null && e.getMessage().contains("email") ? "email" : "username";
            String msg = campo.equals("email") ? "Este e-mail já está em uso." : "Este nome de usuário já está em uso.";
            throw new ErroNegocio(HttpStatus.CONFLICT, "Corrija os campos destacados.", Map.of(campo, msg));
        }
        if (id == null) throw new IllegalStateException("Usuário não foi criado.");

        try {
            verificacao.enviarCodigo(id, username, email);
        } catch (RuntimeException e) {
            // Sem e-mail enviado não há como confirmar a conta: desfaz o cadastro para a pessoa tentar de novo.
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
        // O BCrypt só aceita até 72 bytes: senhas maiores nunca foram aceitas no cadastro.
        boolean cabe = senha.getBytes(StandardCharsets.UTF_8).length <= 72;
        boolean confere = codificador.matches(cabe ? senha : "x", u.map(UsuarioParaLogin::senhaHash).orElse(HASH_FALSO));

        // Mesma mensagem para usuário inexistente e senha errada.
        if (u.isEmpty() || !confere || !cabe) throw new ErroNegocio(HttpStatus.UNAUTHORIZED, "Usuário ou senha inválidos.");
        UsuarioParaLogin conta = u.get();

        if (!"ativa".equals(conta.status())) throw new ErroNegocio(HttpStatus.FORBIDDEN, "Esta conta não está ativa.");

        if (!conta.emailVerificado()) {
            try {
                verificacao.enviarCodigo(conta.idUsuario(), conta.username(), conta.email());
            } catch (ErroNegocio ignorado) {
                // Em intervalo de reenvio ou com falha de envio: a tela do código mostra as opções.
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

    /** A resposta é a mesma exista ou não conta pendente, para não revelar quais e-mails estão cadastrados. */
    public void reenviarCodigo(String emailBruto) {
        String email = Validacao.texto(emailBruto).toLowerCase(Locale.ROOT);
        usuarios.buscarPendentePorEmail(email)
            .ifPresent(p -> verificacao.enviarCodigo(p.idUsuario(), p.username(), p.email()));
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
