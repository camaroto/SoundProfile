package br.edu.ifms.soundprofile.spotify;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

/**
 * Descobre o trecho de 30 s de uma música. O Spotify deixou de entregar o preview_url a apps novos,
 * então a busca é feita no Deezer. Os links do Deezer expiram em algumas horas: o cache dura 30 minutos.
 */
@Service
public class PreviewService {

    private static final Duration VALIDADE = Duration.ofMinutes(30);
    private static final int MAX_ENTRADAS = 2000;

    private record Entrada(String url, Instant expiraEm) {
    }

    private final DeezerClient deezer;
    private final Map<String, Entrada> cache = new ConcurrentHashMap<>();

    public PreviewService(DeezerClient deezer) {
        this.deezer = deezer;
    }

    /** Vazio quando não existe preview (o botão some ou avisa "indisponível"). */
    public Optional<String> buscar(String titulo, String artista) {
        String chave = DeezerClient.normalizar(titulo) + "|" + DeezerClient.normalizar(artista);
        Entrada guardada = cache.get(chave);
        if (guardada != null && guardada.expiraEm().isAfter(Instant.now())) {
            return Optional.ofNullable(guardada.url());
        }

        Optional<String> url = deezer.buscarPreview(titulo, artista);
        if (cache.size() >= MAX_ENTRADAS) cache.clear();
        // "Sem preview" também é guardado por um tempo menor, para não repetir a consulta a cada clique.
        cache.put(chave, new Entrada(url.orElse(null), Instant.now().plus(url.isPresent() ? VALIDADE : Duration.ofMinutes(5))));
        return url;
    }
}
