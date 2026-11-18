package br.edu.ifms.soundprofile;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class SoundProfileApplication {

    public static void main(String[] args) {
        SpringApplication.run(SoundProfileApplication.class, args);
    }
}
