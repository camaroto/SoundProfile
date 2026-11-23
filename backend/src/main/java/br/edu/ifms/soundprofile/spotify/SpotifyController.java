
package br.edu.ifms.soundprofile.spotify;

import java.util.List;

import br.edu.ifms.soundprofile.security.UsuarioAtual;
import br.edu.ifms.soundprofile.security.UsuarioLogado;
import br.edu.ifms.soundprofile.spotify.dto.SpotifyImportacaoDTO;
import br.edu.ifms.soundprofile.spotify.dto.SpotifyMusicaDTO;
import br.edu.ifms.soundprofile.spotify.dto.SpotifyMusicaImportadaDTO;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/spotify")
public class SpotifyController {

    private final SpotifyService spotifyService;

    public SpotifyController(SpotifyService spotifyService) {
        this.spotifyService = spotifyService;
    }

    @GetMapping("/search")
    public List<SpotifyMusicaDTO> pesquisar(
            @RequestParam String q
    ) {
        return spotifyService.pesquisarMusicas(q);
    }

    /** Botão "Avaliar": importa só esta música e devolve o slug dela no catálogo. Exige login. */
    @PostMapping("/musicas/{spotifyId}/importar")
    public SpotifyMusicaImportadaDTO importarMusica(@PathVariable String spotifyId) {
        UsuarioLogado usuario = UsuarioAtual.exigir();

        return spotifyService.importarMusica(spotifyId, usuario.idUsuario());
    }

    @PostMapping("/import")
    public SpotifyImportacaoDTO importar(
            @RequestParam String q
    ) {
        UsuarioLogado usuario = UsuarioAtual.exigir();

        return spotifyService.importarMusicas(
                q,
                usuario.idUsuario()
        );
    }
}