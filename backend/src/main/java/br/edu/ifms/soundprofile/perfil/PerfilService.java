package br.edu.ifms.soundprofile.perfil;

import br.edu.ifms.soundprofile.comum.ErroNegocio;
import br.edu.ifms.soundprofile.comum.Validacao;
import br.edu.ifms.soundprofile.perfil.PerfilRepository.PerfilDados;
import br.edu.ifms.soundprofile.security.UsuarioAtual;
import br.edu.ifms.soundprofile.security.UsuarioLogado;
import br.edu.ifms.soundprofile.seguidor.SeguidorRepository;
import br.edu.ifms.soundprofile.seguidor.SeguidorRepository.Contagem;
import br.edu.ifms.soundprofile.seguidor.SeguidorRepository.Relacao;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class PerfilService {

    // Lista permitida: só estes ids são gravados (a mesma do site, em lib/molduras.ts).
    static final Set<String> MOLDURAS = Set.of("kraken", "sakura");
    static final Set<String> BALOES = Set.of("reticencias", "wtf", "simbolos", "fuck");

    private final PerfilRepository perfis;
    private final SeguidorRepository seguidores;

    public PerfilService(PerfilRepository perfis, SeguidorRepository seguidores) {
        this.perfis = perfis;
        this.seguidores = seguidores;
    }

    public record PerfilCompleto(PerfilDados perfil, Contagem rede, boolean ehDono, Relacao relacao) {
    }

    /** Perfil público. Quem está logado e vê o perfil de outra pessoa também recebe a relação de seguir. */
    public PerfilCompleto ver(String username) {
        PerfilDados p = perfis.buscarPorUsername(Validacao.texto(username))
            .orElseThrow(() -> new ErroNegocio(HttpStatus.NOT_FOUND, "Perfil não encontrado."));
        Optional<UsuarioLogado> eu = UsuarioAtual.opcional();
        boolean ehDono = eu.map(u -> u.idUsuario() == p.idUsuario()).orElse(false);
        Relacao relacao = eu.isPresent() && !ehDono ? seguidores.relacao(eu.get().idUsuario(), p.idUsuario()) : null;
        return new PerfilCompleto(p, seguidores.contagem(p.idUsuario()), ehDono, relacao);
    }

    /** Aba "Perfil": nome, localização e biografia. */
    public PerfilCompleto atualizarDados(String nomeBruto, String localizacaoBruta, String biografiaBruta) {
        UsuarioLogado eu = UsuarioAtual.exigir();
        String nome = Validacao.texto(nomeBruto);
        String localizacao = Validacao.texto(localizacaoBruta);
        String biografia = Validacao.texto(biografiaBruta);

        Map<String, String> erros = Validacao.validarPerfil(nome, localizacao, biografia);
        if (!erros.isEmpty()) throw new ErroNegocio(HttpStatus.BAD_REQUEST, "Corrija os campos destacados.", erros);

        perfis.atualizarDados(eu.idUsuario(), nome.isEmpty() ? null : nome,
            localizacao.isEmpty() ? null : localizacao, biografia);
        return ver(eu.username());
    }

    /** Aba "Personalização": moldura e balão (as imagens de foto e banner entram na próxima etapa). */
    public PerfilCompleto atualizarPersonalizacao(String molduraBruta, String balaoBruto) {
        UsuarioLogado eu = UsuarioAtual.exigir();
        String moldura = vazioParaNulo(molduraBruta);
        String balao = vazioParaNulo(balaoBruto);

        Map<String, String> erros = new LinkedHashMap<>();
        if (moldura != null && !MOLDURAS.contains(moldura)) erros.put("moldura", "Moldura inválida.");
        if (balao != null && !BALOES.contains(balao)) erros.put("balao", "Balão inválido.");
        if (!erros.isEmpty()) throw new ErroNegocio(HttpStatus.BAD_REQUEST, "Corrija os campos destacados.", erros);

        perfis.atualizarPersonalizacao(eu.idUsuario(), moldura, balao);
        return ver(eu.username());
    }

    private static String vazioParaNulo(String valor) {
        String t = Validacao.texto(valor);
        return t.isEmpty() ? null : t;
    }
}
