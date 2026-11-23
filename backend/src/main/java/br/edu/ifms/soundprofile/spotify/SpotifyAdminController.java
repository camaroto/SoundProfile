package br.edu.ifms.soundprofile.spotify;

import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Manutenção do catálogo vinda do Spotify. Só administradores (veja o SecurityConfig). */
@RestController
@RequestMapping("/api/admin/spotify")
public class SpotifyAdminController {

    private final SpotifyCatalogoInicial catalogoInicial;
    private final SpotifyService spotify;

    public SpotifyAdminController(SpotifyCatalogoInicial catalogoInicial, SpotifyService spotify) {
        this.catalogoInicial = catalogoInicial;
        this.spotify = spotify;
    }

    /** Importa as músicas famosas e as marca como destaque (demora alguns segundos). */
    @PostMapping("/catalogo-inicial")
    public Map<String, Integer> catalogoInicial() {
        return Map.of("destacadas", catalogoInicial.executar());
    }

    /** Completa foto e gêneros dos artistas que foram importados sem eles (até 40 por chamada). */
    @PostMapping("/enriquecer-artistas")
    public Map<String, Integer> enriquecerArtistas() {
        return Map.of("tratados", spotify.enriquecerArtistasPendentes(40));
    }
}
