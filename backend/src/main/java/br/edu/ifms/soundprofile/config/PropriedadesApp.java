package br.edu.ifms.soundprofile.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/** Configurações próprias do SoundProfile (veja o bloco "app" do application.yml). */
@ConfigurationProperties(prefix = "app")
public record PropriedadesApp(List<String> corsOrigens, int sessaoDias, Email email) {

    public record Email(String brevoApiKey, String resendApiKey, String de, String deNome, boolean modoDesenvolvimento) {
        public boolean temBrevo() {
            return brevoApiKey != null && !brevoApiKey.isBlank() && de != null && !de.isBlank();
        }

        public boolean temResend() {
            return resendApiKey != null && !resendApiKey.isBlank() && de != null && !de.isBlank();
        }
    }
}
