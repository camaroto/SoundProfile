package br.edu.ifms.soundprofile.perfil;

import br.edu.ifms.soundprofile.perfil.PerfilService.PerfilCompleto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class PerfilController {

    public record DadosRequisicao(String nomeExibicao, String localizacao, String biografia) {
    }

    public record PersonalizacaoRequisicao(String moldura, String balao) {
    }

    private final PerfilService servico;

    public PerfilController(PerfilService servico) {
        this.servico = servico;
    }

    /** Público (UC02): qualquer pessoa vê o perfil. */
    @GetMapping("/perfis/{username}")
    public PerfilCompleto ver(@PathVariable String username) {
        return servico.ver(username);
    }

    /** RN05: só o dono altera o próprio perfil. O alvo é sempre o usuário do token, nunca um id do corpo. */
    @PutMapping("/perfil/dados")
    public PerfilCompleto atualizarDados(@RequestBody DadosRequisicao r) {
        return servico.atualizarDados(r.nomeExibicao(), r.localizacao(), r.biografia());
    }

    @PutMapping("/perfil/personalizacao")
    public PerfilCompleto atualizarPersonalizacao(@RequestBody PersonalizacaoRequisicao r) {
        return servico.atualizarPersonalizacao(r.moldura(), r.balao());
    }
}
