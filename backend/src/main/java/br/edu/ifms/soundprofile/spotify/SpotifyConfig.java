package br.edu.ifms.soundprofile.spotify;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class SpotifyConfig {

    @Bean
    public RestClient spotifyRestClient(SpotifyPropriedades propriedades) {
        return RestClient.builder()
                .baseUrl(propriedades.apiBaseUrl())
                .build();
    }
}