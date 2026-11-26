package br.edu.ifms.soundprofile.spotify;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import tools.jackson.databind.JsonNode;

@Service
public class SpotifyGeneros {

    private static final Logger log = LoggerFactory.getLogger(SpotifyGeneros.class);

    private static final int MINIMO_ARTISTAS_POR_GENERO = 12;
    private static final int PAGINAS_POR_TERMO = 2; // o Spotify devolve até 10 por página

    // slug do gênero no SoundProfile -> termos de gênero usados na busca do Spotify
    private static final Map<String, List<String>> TERMOS = Map.ofEntries(
            Map.entry("rock", List.of("rock")),
            Map.entry("pop", List.of("pop")),
            Map.entry("metal", List.of("metal")),
            Map.entry("punk", List.of("punk")),
            Map.entry("indie", List.of("indie")),
            Map.entry("rap", List.of("hip hop", "rap")),
            Map.entry("rb-soul", List.of("r&b", "soul")),
            Map.entry("jazz", List.of("jazz")),
            Map.entry("mpb", List.of("mpb", "bossa nova")),
            Map.entry("samba-pagode", List.of("samba", "pagode")),
            Map.entry("sertanejo", List.of("sertanejo")),
            Map.entry("funk", List.of("funk")),
            Map.entry("eletronica", List.of("electronic", "edm")),
            Map.entry("blues", List.of("blues")),
            Map.entry("reggae", List.of("reggae")),
            Map.entry("country", List.of("country")),
            Map.entry("classica", List.of("classical")),
            Map.entry("folk", List.of("folk")));

    private final RestClient spotifyRestClient;
    private final SpotifyTokenService tokenService;
    private final SpotifyRepository repository;
    private final JdbcClient jdbc;

    public SpotifyGeneros(
            RestClient spotifyRestClient,
            SpotifyTokenService tokenService,
            SpotifyRepository repository,
            JdbcClient jdbc) {
        this.spotifyRestClient = spotifyRestClient;
        this.tokenService = tokenService;
        this.repository = repository;
        this.jdbc = jdbc;
    }

    /** Completa todos os gêneros que ainda têm poucos artistas. Devolve quantos artistas foram ligados. */
    public int popularTodos() {
        int total = 0;
        for (String slug : TERMOS.keySet()) {
            if (contarArtistas(slug) < MINIMO_ARTISTAS_POR_GENERO) {
                total += popular(slug);
            }
        }
        return total;
    }

    public int popular(String slugGenero) {
        List<String> termos = TERMOS.get(slugGenero);
        if (termos == null) {
            return 0;
        }

        int ligados = 0;
        for (String termo : termos) {
            for (int pagina = 0; pagina < PAGINAS_POR_TERMO; pagina++) {
                final int deslocamento = pagina * 10;
                JsonNode itens;
                try {
                    JsonNode resposta = spotifyRestClient.get()
                            .uri(uriBuilder -> uriBuilder
                                    .path("/search")
                                    .queryParam("q", "{q}")
                                    .queryParam("type", "artist")
                                    .queryParam("limit", 10)
                                    .queryParam("offset", deslocamento)
                                    .build(Map.of("q", "genre:\"" + termo + "\"")))
                            .headers(headers -> headers.setBearerAuth(tokenService.obterToken()))
                            .retrieve()
                            .body(JsonNode.class);
                    itens = resposta == null ? null : resposta.path("artists").path("items");
                } catch (RestClientException e) {
                    log.warn("Gênero {}: Spotify indisponível ({})", slugGenero, e.getClass().getSimpleName());
                    break;
                }
                if (itens == null || itens.isEmpty()) {
                    break;
                }

                for (JsonNode artista : itens) {
                    String spotifyId = artista.path("id").asText();
                    String nome = artista.path("name").asText();
                    if (spotifyId.isBlank() || nome.isBlank()) {
                        continue;
                    }

                    long idArtista = repository.salvarArtista(criarSlug(nome, spotifyId), nome, spotifyId);
                    repository.atualizarImagemArtista(idArtista, artista.path("images").path(0).path("url").asText(null));

                    // Liga ao gênero buscado e a qualquer outro que o Spotify informe para o artista.
                    Set<String> generos = new LinkedHashSet<>();
                    generos.add(slugGenero);
                    List<String> origem = new ArrayList<>();
                    for (JsonNode g : artista.path("genres")) {
                        origem.add(g.asText());
                    }
                    generos.addAll(MapaGeneros.slugs(origem));
                    repository.vincularGeneros(idArtista, generos);
                    ligados++;
                }

                try {
                    Thread.sleep(200); // educado com o limite de requisições do Spotify
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return ligados;
                }
            }
        }
        return ligados;
    }

    private long contarArtistas(String slugGenero) {
        return jdbc.sql("""
                SELECT COUNT(*) FROM artistagenero ag
                  JOIN genero g ON g.idgenero = ag.idgenero
                 WHERE g.slug = :slug
                """)
                .param("slug", slugGenero)
                .query(Long.class)
                .single();
    }

    private static String criarSlug(String nome, String spotifyId) {
        String base = Normalizer.normalize(nome, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        if (base.isBlank()) {
            base = "item";
        }
        String sufixo = "-" + spotifyId;
        int limiteBase = 80 - sufixo.length();
        if (base.length() > limiteBase) {
            base = base.substring(0, limiteBase);
        }
        return base + sufixo;
    }
}