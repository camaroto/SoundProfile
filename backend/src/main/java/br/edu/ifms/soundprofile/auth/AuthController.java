package br.edu.ifms.soundprofile.auth;

import br.edu.ifms.soundprofile.auth.AuthService.SessaoResposta;
import br.edu.ifms.soundprofile.security.SessaoFilter;
import br.edu.ifms.soundprofile.security.UsuarioAtual;
import br.edu.ifms.soundprofile.security.UsuarioLogado;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Cadastro, confirmação de e-mail, login e logout. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    public record GoogleUsernameRequisicao(String tokenCadastro, String username) {
    }

    public record GoogleFinalizarRequisicao(String tokenCadastro, String username) {
    }

    public record DisponibilidadeResposta(boolean disponivel) {
    }

    public record CadastroRequisicao(String username, String email, String password) {
    }

    public record LoginRequisicao(String login, String password) {
    }

    public record VerificarRequisicao(String email, String codigo) {
    }

    public record EmailRequisicao(String email) {
    }

    public record CadastroResposta(String email, String mensagem) {
    }

    public record GoogleRequisicao(String code, String redirectUri) {
    }

    public record Mensagem(String mensagem) {
    }

    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    @PostMapping("/cadastro")
    public ResponseEntity<CadastroResposta> cadastrar(@RequestBody CadastroRequisicao r) {
        String email = auth.cadastrar(r.username(), r.email(), r.password());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new CadastroResposta(email, "Enviamos um código de 6 dígitos para o seu e-mail."));
    }

    @PostMapping("/verificar-email")
    public SessaoResposta verificarEmail(@RequestBody VerificarRequisicao r) {
        return auth.verificarEmail(r.email(), r.codigo());
    }

    @PostMapping("/reenviar-codigo")
    public Mensagem reenviarCodigo(@RequestBody EmailRequisicao r) {
        auth.reenviarCodigo(r.email());
        return new Mensagem("Se houver uma conta aguardando confirmação, enviamos um novo código para o e-mail.");
    }

    @PostMapping("/login")
    public SessaoResposta entrar(@RequestBody LoginRequisicao r) {
        return auth.entrar(r.login(), r.password());
    }

    /** O site recebe o código do Google e o entrega aqui para virar uma sessão. */

    @PostMapping("/google")
    public AuthService.GoogleResposta google(@RequestBody GoogleRequisicao r) {
        return auth.entrarComGoogle(r.code(), r.redirectUri());
    }

    @PostMapping("/google/username-disponivel")
    public DisponibilidadeResposta usernameGoogleDisponivel(
            @RequestBody GoogleUsernameRequisicao r) {
        return new DisponibilidadeResposta(
                auth.usernameGoogleDisponivel(r.tokenCadastro(), r.username()));
    }

    @PostMapping("/google/finalizar")
    public AuthService.SessaoResposta finalizarGoogle(
            @RequestBody GoogleFinalizarRequisicao r) {
        return auth.finalizarCadastroGoogle(r.tokenCadastro(), r.username());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> sair(HttpServletRequest req) {
        String token = SessaoFilter.lerToken(req);
        if (token != null)
            auth.sair(token);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public UsuarioLogado eu() {
        return UsuarioAtual.exigir();
    }
}
