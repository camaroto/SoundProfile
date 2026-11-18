package br.edu.ifms.soundprofile.security;

import br.edu.ifms.soundprofile.comum.ErroNegocio;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/** Acesso ao usuário autenticado dentro dos controladores e serviços. */
public final class UsuarioAtual {

    private UsuarioAtual() {
    }

    public static Optional<UsuarioLogado> opcional() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UsuarioLogado usuario) {
            return Optional.of(usuario);
        }
        return Optional.empty();
    }

    public static UsuarioLogado exigir() {
        return opcional().orElseThrow(() -> new ErroNegocio(HttpStatus.UNAUTHORIZED, "Faça login para continuar."));
    }
}
