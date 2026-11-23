package br.edu.ifms.soundprofile.spotify;

import br.edu.ifms.soundprofile.comum.ErroNegocio;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/preview")
public class PreviewController {

    public record PreviewResposta(String url) {
    }

    private final PreviewService servico;

    public PreviewController(PreviewService servico) {
        this.servico = servico;
    }

    /** Público: devolve {"url": "..."} ou {"url": null} quando não há preview para a música. */
    @GetMapping
    public PreviewResposta buscar(@RequestParam String titulo, @RequestParam String artista) {
        String t = titulo.trim();
        String a = artista.trim();
        if (t.isEmpty() || a.isEmpty() || t.length() > 200 || a.length() > 200) {
            throw new ErroNegocio(HttpStatus.BAD_REQUEST, "Informe o título e o artista.");
        }
        return new PreviewResposta(servico.buscar(t, a).orElse(null));
    }
}
