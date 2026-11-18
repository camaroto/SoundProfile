package br.edu.ifms.soundprofile.imagem;

import java.time.Duration;
import java.util.Optional;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/** Entrega as imagens (avatar, banner, capas) guardadas no banco. Cada troca gera um id novo, então o cache pode ser longo. */
@RestController
public class ImagemController {

    private final JdbcClient jdbc;

    public ImagemController(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    private record Arquivo(String tipo, byte[] dados) {
    }

    @GetMapping("/api/imagens/{id}")
    public ResponseEntity<byte[]> ver(@PathVariable long id) {
        Optional<Arquivo> arquivo = jdbc.sql("SELECT tipo, dados FROM imagem WHERE idimagem = :id")
            .param("id", id)
            .query((rs, n) -> new Arquivo(rs.getString("tipo"), rs.getBytes("dados")))
            .optional();
        if (arquivo.isEmpty()) return ResponseEntity.notFound().build();

        MediaType tipo;
        try {
            tipo = MediaType.parseMediaType(arquivo.get().tipo());
            if (!"image".equals(tipo.getType())) tipo = MediaType.APPLICATION_OCTET_STREAM;
        } catch (RuntimeException e) {
            tipo = MediaType.APPLICATION_OCTET_STREAM;
        }
        return ResponseEntity.ok()
            .contentType(tipo)
            .cacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable())
            .header("X-Content-Type-Options", "nosniff")
            .body(arquivo.get().dados());
    }
}
