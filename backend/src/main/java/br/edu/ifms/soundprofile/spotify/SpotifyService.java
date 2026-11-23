
package br.edu.ifms.soundprofile.spotify;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

import br.edu.ifms.soundprofile.spotify.dto.SpotifyImportacaoDTO;
import br.edu.ifms.soundprofile.spotify.dto.SpotifyMusicaDTO;
import br.edu.ifms.soundprofile.spotify.dto.SpotifyMusicaImportadaDTO;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import tools.jackson.databind.JsonNode;

import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class SpotifyService {

    private final RestClient spotifyRestClient;
    private final SpotifyTokenService tokenService;
    private final SpotifyRepository repository;
    private final DeezerClient deezer;

    private static final int LIMITE_IMPORTACOES_POR_HORA = 60;

    public SpotifyService(
            RestClient spotifyRestClient,
            SpotifyTokenService tokenService,
            SpotifyRepository repository,
            DeezerClient deezer) {
        this.spotifyRestClient = spotifyRestClient;
        this.tokenService = tokenService;
        this.repository = repository;
        this.deezer = deezer;
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

    /**
     * Botão "Avaliar" dos resultados da busca: traz só esta música (com álbum e artista) para o catálogo
     * e devolve o endereço dela no SoundProfile. Se já existir, devolve na hora.
     */
    @Transactional
    public SpotifyMusicaImportadaDTO importarMusica(String spotifyId, long idUsuario) {
        if (spotifyId == null || !spotifyId.matches("[A-Za-z0-9]{22}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Música inválida.");
        }

        Optional<String> existente = repository.slugDaMusica(spotifyId);
        if (existente.isPresent()) {
            return new SpotifyMusicaImportadaDTO(existente.get(), null);
        }

        if (repository.contarImportacoesRecentes(idUsuario) >= LIMITE_IMPORTACOES_POR_HORA) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Você atingiu o limite de importações por hora. Tente novamente mais tarde.");
        }

        JsonNode faixa;
        try {
            faixa = spotifyRestClient.get()
                    .uri("/tracks/{id}", spotifyId)
                    .headers(headers -> headers.setBearerAuth(tokenService.obterToken()))
                    .retrieve()
                    .body(JsonNode.class);
        } catch (HttpClientErrorException.NotFound e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Música não encontrada no Spotify.");
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Não foi possível falar com o Spotify agora.");
        }
        if (faixa == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Música não encontrada no Spotify.");
        }

        String slug = salvarFaixaCompleta(faixa);
        repository.registrarImportacao(idUsuario);
        return new SpotifyMusicaImportadaDTO(slug, faixa.path("name").asText(null));
    }

    /** Salva artista (com foto e gêneros), álbum e música. Devolve o slug da música. */
    @Transactional
    public String salvarFaixaCompleta(JsonNode musica) {
        String spotifyId = musica.path("id").asText();
        String nome = musica.path("name").asText();

        JsonNode artista = musica.path("artists").path(0);
        String artistaSpotifyId = artista.path("id").asText();
        String nomeArtista = artista.path("name").asText();

        JsonNode album = musica.path("album");
        String albumSpotifyId = album.path("id").asText();
        String nomeAlbum = album.path("name").asText();

        if (spotifyId.isBlank() || nome.isBlank() || artistaSpotifyId.isBlank() || nomeArtista.isBlank()
                || albumSpotifyId.isBlank() || nomeAlbum.isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Música sem dados suficientes no Spotify.");
        }

        long idArtista = repository.salvarArtista(criarSlug(nomeArtista, artistaSpotifyId, 80), nomeArtista, artistaSpotifyId);
        enriquecerArtista(idArtista, artistaSpotifyId, nomeArtista, nome);

        long idAlbum = repository.salvarAlbum(
                criarSlug(nomeAlbum, albumSpotifyId, 80),
                nomeAlbum,
                idArtista,
                extrairAno(album.path("release_date").asText()),
                album.path("images").path(0).path("url").asText(null),
                albumSpotifyId);

        Integer faixa = musica.path("track_number").asInt();
        if (faixa < 1 || faixa > 500) {
            faixa = null;
        }

        repository.salvarMusica(criarSlug(nome, spotifyId, 100), nome, idArtista, idAlbum, faixa, spotifyId);
        return repository.slugDaMusica(spotifyId).orElseThrow();
    }

    /**
     * Foto e gêneros do artista. O Spotify é a primeira fonte; quando ele não informa os gêneros,
     * usa o Deezer. Sem gênero, as páginas de gênero ficam vazias.
     */
    private void enriquecerArtista(long idArtista, String artistaSpotifyId, String nomeArtista, String tituloFaixa) {
        if (repository.artistaCompleto(idArtista)) {
            return;
        }

        String imagem = null;
        Set<String> generos = new LinkedHashSet<>();
        try {
            JsonNode dados = spotifyRestClient.get()
                    .uri("/artists/{id}", artistaSpotifyId)
                    .headers(headers -> headers.setBearerAuth(tokenService.obterToken()))
                    .retrieve()
                    .body(JsonNode.class);
            if (dados != null) {
                imagem = dados.path("images").path(0).path("url").asText(null);
                List<String> origem = new ArrayList<>();
                for (JsonNode g : dados.path("genres")) {
                    origem.add(g.asText());
                }
                generos.addAll(MapaGeneros.slugs(origem));
            }
        } catch (RestClientException e) {
            // Sem foto/gênero agora; uma próxima importação ou o ajuste do administrador tenta de novo.
        }

        if (generos.isEmpty() && tituloFaixa != null) {
            generos.addAll(MapaGeneros.slugs(deezer.generosDaFaixa(tituloFaixa, nomeArtista)));
        }

        repository.atualizarImagemArtista(idArtista, imagem);
        repository.vincularGeneros(idArtista, generos);
    }

    /** Completa foto e gêneros dos artistas importados antes desta atualização. Devolve quantos foram tratados. */
    public int enriquecerArtistasPendentes(int limite) {
        int tratados = 0;
        for (SpotifyRepository.ArtistaPendente a : repository.artistasPendentes(limite)) {
            enriquecerArtista(a.idArtista(), a.spotifyId(), a.nome(), a.tituloFaixa());
            tratados++;
        }
        return tratados;
    }

    /** Primeira faixa que combina com a consulta (usada pelo catálogo inicial). */
    public Optional<JsonNode> buscarPrimeiraFaixa(String consulta) {
        JsonNode resposta = spotifyRestClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search")
                        .queryParam("q", "{q}")
                        .queryParam("type", "track")
                        .queryParam("limit", 1)
                        .build(java.util.Map.of("q", consulta)))
                .headers(headers -> headers.setBearerAuth(tokenService.obterToken()))
                .retrieve()
                .body(JsonNode.class);
        if (resposta == null) {
            return Optional.empty();
        }
        JsonNode primeira = resposta.path("tracks").path("items").path(0);
        return primeira.isMissingNode() || primeira.isNull() ? Optional.empty() : Optional.of(primeira);
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