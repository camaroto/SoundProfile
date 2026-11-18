package br.edu.ifms.soundprofile.seguidor;

import br.edu.ifms.soundprofile.comum.ErroNegocio;
import br.edu.ifms.soundprofile.comum.Validacao;
import br.edu.ifms.soundprofile.notificacao.NotificacaoRepository;
import br.edu.ifms.soundprofile.seguidor.SeguidorRepository.Pessoa;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class SeguidorService {

    // Freio contra automação: quantas pessoas alguém pode começar a seguir por hora.
    static final int MAX_SEGUIDAS_POR_HORA = 100;

    private final SeguidorRepository seguidores;
    private final NotificacaoRepository notificacoes;

    public SeguidorService(SeguidorRepository seguidores, NotificacaoRepository notificacoes) {
        this.seguidores = seguidores;
        this.notificacoes = notificacoes;
    }

    private long idDe(String username) {
        return seguidores.idDoUsuarioAtivo(username)
            .orElseThrow(() -> new ErroNegocio(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
    }

    /** Seguir não precisa de aprovação. Repetir a ação não duplica o vínculo nem gera um segundo aviso. */
    public void seguir(long eu, String username) {
        long outro = idDe(username);
        if (eu == outro) throw new ErroNegocio(HttpStatus.BAD_REQUEST, "Você não pode seguir a si mesmo.");
        if (seguidores.seguidasNaUltimaHora(eu) >= MAX_SEGUIDAS_POR_HORA) {
            throw new ErroNegocio(HttpStatus.TOO_MANY_REQUESTS,
                "Você seguiu muitas pessoas em pouco tempo. Tente novamente mais tarde.");
        }
        if (seguidores.seguir(eu, outro)) {
            notificacoes.criar(outro, NotificacaoRepository.NOVO_SEGUIDOR, eu);
        }
    }

    public void deixarDeSeguir(long eu, String username) {
        long outro = idDe(username);
        seguidores.deixarDeSeguir(eu, outro);
        // Se o aviso ainda não tinha sido lido, ele some junto.
        notificacoes.apagarNaoLida(outro, NotificacaoRepository.NOVO_SEGUIDOR, eu);
    }

    private static String padrao(String q) {
        String t = Validacao.texto(q);
        if (t.isEmpty()) return null;
        return Validacao.padraoBusca(t.length() > 60 ? t.substring(0, 60) : t);
    }

    public List<Pessoa> seguindo(long eu, String q) {
        return seguidores.listarSeguindo(eu, padrao(q));
    }

    public List<Pessoa> seguidores(long eu, String q) {
        return seguidores.listarSeguidores(eu, padrao(q));
    }

    public List<Pessoa> buscar(long eu, String q) {
        String t = Validacao.texto(q);
        if (t.isEmpty()) return List.of();
        String termo = t.length() > 60 ? t.substring(0, 60) : t;
        return seguidores.buscar(eu, Validacao.padraoBusca(termo), termo);
    }
}
