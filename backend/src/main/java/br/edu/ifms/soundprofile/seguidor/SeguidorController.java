package br.edu.ifms.soundprofile.seguidor;

import br.edu.ifms.soundprofile.security.UsuarioAtual;
import br.edu.ifms.soundprofile.seguidor.SeguidorRepository.Pessoa;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Seguir pessoas, listas de seguindo/seguidores e pesquisa de usuários. Tudo exige login. */
@RestController
@RequestMapping("/api")
public class SeguidorController {

    private final SeguidorService servico;

    public SeguidorController(SeguidorService servico) {
        this.servico = servico;
    }

    @PostMapping("/usuarios/{username}/seguir")
    public ResponseEntity<Void> seguir(@PathVariable String username) {
        servico.seguir(UsuarioAtual.exigir().idUsuario(), username);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/usuarios/{username}/seguir")
    public ResponseEntity<Void> deixarDeSeguir(@PathVariable String username) {
        servico.deixarDeSeguir(UsuarioAtual.exigir().idUsuario(), username);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/seguindo")
    public List<Pessoa> seguindo(@RequestParam(required = false) String q) {
        return servico.seguindo(UsuarioAtual.exigir().idUsuario(), q);
    }

    @GetMapping("/seguidores")
    public List<Pessoa> seguidores(@RequestParam(required = false) String q) {
        return servico.seguidores(UsuarioAtual.exigir().idUsuario(), q);
    }

    @GetMapping("/usuarios/busca")
    public List<Pessoa> buscar(@RequestParam(required = false) String q) {
        return servico.buscar(UsuarioAtual.exigir().idUsuario(), q);
    }
}
