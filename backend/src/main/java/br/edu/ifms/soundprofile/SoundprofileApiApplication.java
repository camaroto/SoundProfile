package br.edu.ifms.soundprofile;

import br.edu.ifms.soundprofile.auth.GooglePropriedades;
import br.edu.ifms.soundprofile.config.PropriedadesApp;
import br.edu.ifms.soundprofile.spotify.SpotifyPropriedades;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({
    PropriedadesApp.class,
    GooglePropriedades.class,
    SpotifyPropriedades.class
})
public class SoundprofileApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(SoundprofileApiApplication.class, args);
    }
}