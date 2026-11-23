package br.edu.ifms.soundprofile.auth;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Credenciais do login com Google (Google Cloud Console > Credenciais > ID do cliente OAuth). */
@ConfigurationProperties(prefix = "google")
public record GooglePropriedades(String clientId, String clientSecret) {

    public boolean configurado() {
        return clientId != null && !clientId.isBlank() && clientSecret != null && !clientSecret.isBlank();
    }
}
