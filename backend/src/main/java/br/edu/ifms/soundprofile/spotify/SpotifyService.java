
package br.edu.ifms.soundprofile.spotify;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import br.edu.ifms.soundprofile.spotify.dto.SpotifyImportacaoDTO;
import br.edu.ifms.soundprofile.spotify.dto.SpotifyMusicaDTO;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import tools.jackson.databind.JsonNode;

import org.springframework.web.client.RestClient;

@Service
public class SpotifyService {

    private final RestClient spotifyRestClient;
    private final SpotifyTokenService tokenService;
    private final SpotifyRepository repository;

    public SpotifyService(
            RestClient spotifyRestClient,
            SpotifyTokenService tokenService,
            SpotifyRepository repository) {
        this.spotifyRestClient = spotifyRestClient;
        this.tokenService = tokenService;
        this.repository = repository;
    }

    public List<SpotifyMusicaDTO> pesquisarMusicas(String consulta) {
        JsonNode musicas = buscarMusicas(consulta);

        List<SpotifyMusicaDTO> resultado = new ArrayList<>();

        for (JsonNode musica : musicas) {
            resultado.add(converterMusica(musica));
        }

        return resultado;
    }

    @Transactional
    public SpotifyImportacaoDTO importarMusicas(
            String consulta,
            long idUsuario) {
        if (consulta == null || consulta.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe o que deseja pesquisar.");
        }

        if (repository.contarImportacoesRecentes(idUsuario) >= 10) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Você atingiu o limite de 10 importações por hora.");
        }

        JsonNode musicas = buscarMusicas(consulta);

        int totalMusicas = 0;
        Set<String> artistasProcessados = new HashSet<>();
        Set<String> albunsProcessados = new HashSet<>();

        for (JsonNode musica : musicas) {
            String spotifyId = musica.path("id").asText();
            String nome = musica.path("name").asText();

            JsonNode artista = musica.path("artists").path(0);
            String artistaSpotifyId = artista.path("id").asText();
            String nomeArtista = artista.path("name").asText();

            JsonNode album = musica.path("album");
            String albumSpotifyId = album.path("id").asText();
            String nomeAlbum = album.path("name").asText();

            if (spotifyId.isBlank()
                    || nome.isBlank()
                    || artistaSpotifyId.isBlank()
                    || nomeArtista.isBlank()
                    || albumSpotifyId.isBlank()
                    || nomeAlbum.isBlank()) {
                continue;
            }

            String slugArtista = criarSlug(
                    nomeArtista,
                    artistaSpotifyId,
                    80);

            long idArtista = repository.salvarArtista(
                    slugArtista,
                    nomeArtista,
                    artistaSpotifyId);

            String slugAlbum = criarSlug(
                    nomeAlbum,
                    albumSpotifyId,
                    80);

            String capa = album.path("images")
                    .path(0)
                    .path("url")
                    .asText(null);

            Integer ano = extrairAno(
                    album.path("release_date").asText());

            long idAlbum = repository.salvarAlbum(
                    slugAlbum,
                    nomeAlbum,
                    idArtista,
                    ano,
                    capa,
                    albumSpotifyId);

            Integer faixa = musica.path("track_number").asInt();

            if (faixa < 1 || faixa > 500) {
                faixa = null;
            }

            String slugMusica = criarSlug(
                    nome,
                    spotifyId,
                    100);

            repository.salvarMusica(
                    slugMusica,
                    nome,
                    idArtista,
                    idAlbum,
                    faixa,
                    spotifyId);

            totalMusicas++;
            artistasProcessados.add(artistaSpotifyId);
            albunsProcessados.add(albumSpotifyId);
        }

        if (totalMusicas > 0) {
            repository.registrarImportacao(idUsuario);
        }

        return new SpotifyImportacaoDTO(
                totalMusicas,
                artistasProcessados.size(),
                albunsProcessados.size());
    }

    private JsonNode buscarMusicas(String consulta) {
        if (consulta == null || consulta.isBlank()) {
            return tools.jackson.databind.node.JsonNodeFactory.instance.arrayNode();
        }

        JsonNode resposta = spotifyRestClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search")
                        .queryParam("q", consulta.trim())
                        .queryParam("type", "track")
                        .queryParam("limit", 10)
                        .build())
                .headers(headers -> headers.setBearerAuth(
                        tokenService.obterToken()))
                .retrieve()
                .body(JsonNode.class);

        if (resposta == null) {
            return tools.jackson.databind.node.JsonNodeFactory.instance.arrayNode();
        }

        return resposta.path("tracks").path("items");
    }

    private SpotifyMusicaDTO converterMusica(JsonNode musica) {
        String spotifyId = musica.path("id").asText();
        String nome = musica.path("name").asText();
        String artista = musica.path("artists")
                .path(0)
                .path("name")
                .asText();

        String album = musica.path("album").path("name").asText();

        String imagem = musica.path("album")
                .path("images")
                .path(0)
                .path("url")
                .asText(null);

        Integer duracao = musica.path("duration_ms").asInt();

        String urlSpotify = musica.path("external_urls")
                .path("spotify")
                .asText();

        return new SpotifyMusicaDTO(
                spotifyId,
                nome,
                artista,
                album,
                imagem,
                duracao,
                urlSpotify);
    }

    private Integer extrairAno(String data) {
        if (data == null || data.length() < 4) {
            return null;
        }

        try {
            int ano = Integer.parseInt(data.substring(0, 4));

            if (ano >= 1900 && ano <= 2100) {
                return ano;
            }
        } catch (NumberFormatException ignored) {
            return null;
        }

        return null;
    }

    private String criarSlug(
            String nome,
            String spotifyId,
            int limite) {
        String base = Normalizer.normalize(
                nome,
                Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");

        if (base.isBlank()) {
            base = "item";
        }

        String sufixo = "-" + spotifyId;
        int limiteBase = limite - sufixo.length();

        if (base.length() > limiteBase) {
            base = base.substring(0, limiteBase);
        }

        return base + sufixo;
    }
}