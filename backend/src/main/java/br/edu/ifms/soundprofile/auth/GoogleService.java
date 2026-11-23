package br.edu.ifms.soundprofile.auth;

import br.edu.ifms.soundprofile.comum.ErroNegocio;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * Login com Google (OAuth 2.0, fluxo "código de autorização"). O site manda o código recebido do Google;
 * aqui ele é trocado por dados da conta, direto com o Google (por TLS), com o segredo guardado só no servidor.
 */
@Service
public class GoogleService {

    private static final Logger log = LoggerFactory.getLogger(GoogleService.class);

    private final GooglePropriedades propriedades;

    public GoogleService(GooglePropriedades propriedades) {
        this.propriedades = propriedades;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record RespostaToken(@JsonProperty("access_token") String accessToken) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record RespostaUsuario(String sub, String email, @JsonProperty("email_verified") Boolean emailVerified,
                                   String name) {
    }

    public record PerfilGoogle(String sub, String email, boolean emailVerificado, String nome) {
    }

    public PerfilGoogle ler(String code, String redirectUri) {
        if (!propriedades.configurado()) {
            throw new ErroNegocio(HttpStatus.SERVICE_UNAVAILABLE, "GOOGLE_NAO_CONFIGURADO",
                "O login com Google ainda não foi configurado.", Map.of());
        }
        try {
            LinkedMultiValueMap<String, String> formulario = new LinkedMultiValueMap<>();
            formulario.add("code", code);
            formulario.add("client_id", propriedades.clientId());
            formulario.add("client_secret", propriedades.clientSecret());
            formulario.add("redirect_uri", redirectUri);
            formulario.add("grant_type", "authorization_code");

            RespostaToken token = RestClient.create().post()
                .uri("https://oauth2.googleapis.com/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(formulario)
                .retrieve()
                .body(RespostaToken.class);
            if (token == null || token.accessToken() == null) throw falha();

            RespostaUsuario usuario = RestClient.create().get()
                .uri("https://openidconnect.googleapis.com/v1/userinfo")
                .headers(h -> h.setBearerAuth(token.accessToken()))
                .retrieve()
                .body(RespostaUsuario.class);
            if (usuario == null || usuario.sub() == null || usuario.email() == null) throw falha();

            return new PerfilGoogle(usuario.sub(), usuario.email().toLowerCase(java.util.Locale.ROOT),
                Boolean.TRUE.equals(usuario.emailVerified()), usuario.name() == null ? "" : usuario.name());
        } catch (RestClientException e) {
            // Só o tipo do erro vai para o log: a mensagem pode trazer partes da requisição.
            log.warn("Falha na comunicação com o Google: {}", e.getClass().getSimpleName());
            throw falha();
        }
    }

    private static ErroNegocio falha() {
        return new ErroNegocio(HttpStatus.UNAUTHORIZED, "GOOGLE_FALHA",
            "Não foi possível entrar com o Google. Tente novamente.", Map.of());
    }
}
