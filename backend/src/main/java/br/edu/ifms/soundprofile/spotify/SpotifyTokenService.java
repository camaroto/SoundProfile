package br.edu.ifms.soundprofile.spotify;

import java.time.Instant;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.annotation.JsonProperty;

@Service
public class SpotifyTokenService {

    private final SpotifyPropriedades propriedades;

    private String token;
    private Instant expiracao;

    public SpotifyTokenService(SpotifyPropriedades propriedades) {
        this.propriedades = propriedades;
    }

    private record RespostaToken(
            @JsonProperty("access_token") String accessToken,
            @JsonProperty("expires_in") long expiresIn
    ) {
    }

    public synchronized String obterToken() {

        if (token != null && Instant.now().isBefore(expiracao)) {
            return token;
        }

        LinkedMultiValueMap<String, String> formulario = new LinkedMultiValueMap<>();
        formulario.add("grant_type", "client_credentials");

        RespostaToken resposta = RestClient.create()
                .post()
                .uri(propriedades.tokenUri())
                .headers(headers -> headers.setBasicAuth(
                        propriedades.clientId(),
                        propriedades.clientSecret()
                ))
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(formulario)
                .retrieve()
                .body(RespostaToken.class);

        if (resposta == null || resposta.accessToken() == null) {
            throw new IllegalStateException("Não foi possível obter o token do Spotify.");
        }

        token = resposta.accessToken();
        expiracao = Instant.now().plusSeconds(
                Math.max(resposta.expiresIn() - 60, 1)
        );

        return token;
    }
}