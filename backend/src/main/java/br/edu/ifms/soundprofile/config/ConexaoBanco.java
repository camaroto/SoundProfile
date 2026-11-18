package br.edu.ifms.soundprofile.config;

import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Converte a DATABASE_URL no formato usado pelo site e pelo Neon
 * (postgresql://usuario:senha@servidor:5432/banco?sslmode=require) para o formato JDBC,
 * que o driver do PostgreSQL exige.
 */
public record ConexaoBanco(String jdbcUrl, String usuario, String senha) {

    public static ConexaoBanco deUrl(String url) {
        URI uri;
        try {
            uri = new URI(url.trim());
        } catch (URISyntaxException e) {
            throw new IllegalArgumentException(
                "DATABASE_URL inválida. Se a senha tiver caracteres especiais (@ : / # ?), codifique-os (ex.: @ vira %40).");
        }

        String esquema = uri.getScheme();
        if (!"postgresql".equals(esquema) && !"postgres".equals(esquema)) {
            throw new IllegalArgumentException("DATABASE_URL deve começar com postgresql://");
        }
        if (uri.getHost() == null) {
            throw new IllegalArgumentException("DATABASE_URL sem servidor. Formato: postgresql://usuario:senha@servidor:5432/banco");
        }

        String usuario = null;
        String senha = null;
        String info = uri.getRawUserInfo();
        if (info != null) {
            int i = info.indexOf(':');
            usuario = decodificar(i < 0 ? info : info.substring(0, i));
            senha = i < 0 ? null : decodificar(info.substring(i + 1));
        }

        int porta = uri.getPort() > 0 ? uri.getPort() : 5432;
        String caminho = uri.getRawPath() == null ? "" : uri.getRawPath();

        List<String> parametros = new ArrayList<>();
        if (uri.getRawQuery() != null) {
            for (String par : uri.getRawQuery().split("&")) {
                if (par.isBlank()) continue;
                String[] partes = par.split("=", 2);
                if (partes[0].equals("channel_binding")) {
                    // O driver JDBC chama este parâmetro de channelBinding.
                    parametros.add("channelBinding=" + (partes.length > 1 ? partes[1] : "prefer"));
                } else {
                    parametros.add(par);
                }
            }
        }
        // Compatível com o pooler (PgBouncer) do Neon: não usa comandos preparados no servidor.
        if (parametros.stream().noneMatch(p -> p.startsWith("prepareThreshold="))) {
            parametros.add("prepareThreshold=0");
        }

        String jdbc = "jdbc:postgresql://" + uri.getHost() + ":" + porta + caminho
            + (parametros.isEmpty() ? "" : "?" + String.join("&", parametros));
        return new ConexaoBanco(jdbc, usuario, senha);
    }

    private static String decodificar(String valor) {
        return URLDecoder.decode(valor, StandardCharsets.UTF_8);
    }
}
