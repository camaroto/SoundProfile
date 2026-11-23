package br.edu.ifms.soundprofile.spotify;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import tools.jackson.databind.JsonNode;

/**
 * Consulta pública (sem chave) à API do Deezer, usada para duas coisas que o Spotify não entrega mais
 * a apps novos: o trecho de 30 segundos da música (preview) e, quando o Spotify não informa, o gênero.
 */
@Component
public class DeezerClient {

    private static final Logger log = LoggerFactory.getLogger(DeezerClient.class);

    private final RestClient http = RestClient.builder().baseUrl("https://api.deezer.com").build();

    public record FaixaDeezer(String titulo, String artista, String preview, long idAlbum) {
    }

    /** Remove acentos, o que vem entre parênteses ou depois de " - " (remaster, ao vivo...) e a pontuação. */
    static String normalizar(String texto) {
        String semAcento = Normalizer.normalize(texto == null ? "" : texto, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return semAcento.toLowerCase(Locale.ROOT)
            .replaceAll("\\(.*?\\)|\\[.*?\\]", " ")
            .replaceAll("\\s-\\s.*$", " ")
            .replaceAll("[^a-z0-9]+", " ")
            .trim();
    }

    private static boolean combina(String procurado, String encontrado) {
        String a = normalizar(procurado);
        String b = normalizar(encontrado);
        return !a.isEmpty() && !b.isEmpty() && (a.equals(b) || b.contains(a) || a.contains(b));
    }

    /** Faixas do Deezer que combinam com o título e o artista (as que não combinam são descartadas). */
    public List<FaixaDeezer> buscarFaixas(String titulo, String artista) {
        List<FaixaDeezer> faixas = new ArrayList<>();
        try {
            String consulta = artista + " " + titulo;
            JsonNode resposta = http.get()
                .uri(b -> b.path("/search").queryParam("q", "{q}").queryParam("limit", 5).build(Map.of("q", consulta)))
                .retrieve()
                .body(JsonNode.class);
            if (resposta == null) return faixas;

            for (JsonNode f : resposta.path("data")) {
                String tituloDeezer = f.path("title").asText("");
                String artistaDeezer = f.path("artist").path("name").asText("");
                if (combina(titulo, tituloDeezer) && combina(artista, artistaDeezer)) {
                    faixas.add(new FaixaDeezer(tituloDeezer, artistaDeezer, f.path("preview").asText(""),
                        f.path("album").path("id").asLong(0)));
                }
            }
        } catch (RestClientException e) {
            log.warn("Deezer indisponível: {}", e.getClass().getSimpleName());
        }
        return faixas;
    }

    public Optional<String> buscarPreview(String titulo, String artista) {
        return buscarFaixas(titulo, artista).stream()
            .map(FaixaDeezer::preview)
            .filter(url -> url != null && url.startsWith("https://"))
            .findFirst();
    }

    /** Gêneros do álbum da faixa no Deezer (ex.: "Rock", "Rap/Hip Hop"). */
    public List<String> generosDaFaixa(String titulo, String artista) {
        List<String> generos = new ArrayList<>();
        List<FaixaDeezer> faixas = buscarFaixas(titulo, artista);
        if (faixas.isEmpty() || faixas.get(0).idAlbum() == 0) return generos;
        try {
            JsonNode album = http.get().uri("/album/{id}", faixas.get(0).idAlbum()).retrieve().body(JsonNode.class);
            if (album != null) {
                for (JsonNode g : album.path("genres").path("data")) {
                    String nome = g.path("name").asText("");
                    if (!nome.isBlank()) generos.add(nome);
                }
            }
        } catch (RestClientException e) {
            log.warn("Deezer indisponível: {}", e.getClass().getSimpleName());
        }
        return generos;
    }
}
