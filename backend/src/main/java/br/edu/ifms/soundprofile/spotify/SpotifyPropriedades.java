package br.edu.ifms.soundprofile.spotify;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "spotify")
public record SpotifyPropriedades(
        String clientId,
        String clientSecret,
        String tokenUri,
        String apiBaseUrl
) {
}
