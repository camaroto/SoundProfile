package br.edu.ifms.soundprofile.seguidor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class SeguidorRepository {

    private final JdbcClient jdbc;

    public SeguidorRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public record Relacao(boolean seguindo, boolean meSegue) {
    }

    public record Pessoa(long idUsuario, String username, String nomeExibicao, String avatar,
                         boolean seguindo, boolean meSegue, OffsetDateTime desde) {
    }

    public record Contagem(int seguidores, int seguindo) {
    }

    /** Só usuários ativos podem ser seguidos ou aparecer em listas. */
    public Optional<Long> idDoUsuarioAtivo(String username) {
        return jdbc.sql("SELECT idusuario FROM usuario WHERE LOWER(username) = LOWER(:u) AND status = 'ativa'")
            .param("u", username).query(Long.class).optional();
    }

    public Relacao relacao(long eu, long outro) {
        return jdbc.sql("""
                SELECT EXISTS (SELECT 1 FROM seguidor WHERE idseguidor = :eu AND idseguido = :outro) AS seguindo,
                       EXISTS (SELECT 1 FROM seguidor WHERE idseguidor = :outro AND idseguido = :eu) AS me_segue
                """)
            .param("eu", eu).param("outro", outro)
            .query((rs, n) -> new Relacao(rs.getBoolean("seguindo"), rs.getBoolean("me_segue")))
            .single();
    }

    public int seguidasNaUltimaHora(long eu) {
        return jdbc.sql("SELECT COUNT(*) FROM seguidor WHERE idseguidor = :eu AND criadoem > now() - interval '1 hour'")
            .param("eu", eu).query(Integer.class).single();
    }

    /** true se criou o vínculo agora; false se já seguia (repetir não duplica nada). */
    public boolean seguir(long eu, long outro) {
        return jdbc.sql("""
                INSERT INTO seguidor (idseguidor, idseguido) VALUES (:eu, :outro)
                ON CONFLICT DO NOTHING RETURNING idseguido
                """)
            .param("eu", eu).param("outro", outro).query(Long.class).optional().isPresent();
    }

    public void deixarDeSeguir(long eu, long outro) {
        jdbc.sql("DELETE FROM seguidor WHERE idseguidor = :eu AND idseguido = :outro")
            .param("eu", eu).param("outro", outro).update();
    }

    public Contagem contagem(long idUsuario) {
        return jdbc.sql("""
                SELECT (SELECT COUNT(*) FROM seguidor s JOIN usuario u ON u.idusuario = s.idseguidor AND u.status = 'ativa'
                         WHERE s.idseguido = :id) AS seguidores,
                       (SELECT COUNT(*) FROM seguidor s JOIN usuario u ON u.idusuario = s.idseguido AND u.status = 'ativa'
                         WHERE s.idseguidor = :id) AS seguindo
                """)
            .param("id", idUsuario)
            .query((rs, n) -> new Contagem(rs.getInt("seguidores"), rs.getInt("seguindo")))
            .single();
    }

    private static Pessoa mapear(java.sql.ResultSet rs) throws java.sql.SQLException {
        return new Pessoa(rs.getLong("idusuario"), rs.getString("username"), rs.getString("nomeexibicao"),
            rs.getString("avatar"), rs.getBoolean("seguindo"), rs.getBoolean("me_segue"),
            rs.getObject("desde", OffsetDateTime.class));
    }

    /** Quem eu sigo. "busca" é um padrão ILIKE já escapado (ou null). */
    public List<Pessoa> listarSeguindo(long eu, String busca) {
        return jdbc.sql("""
                SELECT u.idusuario, u.username, p.nomeexibicao, p.avatar, s.criadoem AS desde, true AS seguindo,
                       EXISTS (SELECT 1 FROM seguidor r WHERE r.idseguidor = u.idusuario AND r.idseguido = :eu) AS me_segue
                  FROM seguidor s
                  JOIN usuario u ON u.idusuario = s.idseguido AND u.status = 'ativa'
                  LEFT JOIN perfil p ON p.idusuario = u.idusuario
                 WHERE s.idseguidor = :eu
                   AND (CAST(:busca AS text) IS NULL OR u.username ILIKE CAST(:busca AS text) OR p.nomeexibicao ILIKE CAST(:busca AS text))
                 ORDER BY LOWER(COALESCE(p.nomeexibicao, u.username)) LIMIT 200
                """)
            .param("eu", eu).param("busca", busca)
            .query((rs, n) -> mapear(rs)).list();
    }

    /** Quem me segue. */
    public List<Pessoa> listarSeguidores(long eu, String busca) {
        return jdbc.sql("""
                SELECT u.idusuario, u.username, p.nomeexibicao, p.avatar, s.criadoem AS desde, true AS me_segue,
                       EXISTS (SELECT 1 FROM seguidor r WHERE r.idseguidor = :eu AND r.idseguido = u.idusuario) AS seguindo
                  FROM seguidor s
                  JOIN usuario u ON u.idusuario = s.idseguidor AND u.status = 'ativa'
                  LEFT JOIN perfil p ON p.idusuario = u.idusuario
                 WHERE s.idseguido = :eu
                   AND (CAST(:busca AS text) IS NULL OR u.username ILIKE CAST(:busca AS text) OR p.nomeexibicao ILIKE CAST(:busca AS text))
                 ORDER BY s.criadoem DESC LIMIT 200
                """)
            .param("eu", eu).param("busca", busca)
            .query((rs, n) -> mapear(rs)).list();
    }

    /** Pesquisa de pessoas por nome de exibição ou nome de usuário. */
    public List<Pessoa> buscar(long eu, String padrao, String termo) {
        return jdbc.sql("""
                SELECT u.idusuario, u.username, p.nomeexibicao, p.avatar, CAST(NULL AS timestamptz) AS desde,
                       EXISTS (SELECT 1 FROM seguidor r WHERE r.idseguidor = :eu AND r.idseguido = u.idusuario) AS seguindo,
                       EXISTS (SELECT 1 FROM seguidor r WHERE r.idseguidor = u.idusuario AND r.idseguido = :eu) AS me_segue
                  FROM usuario u LEFT JOIN perfil p ON p.idusuario = u.idusuario
                 WHERE u.status = 'ativa' AND u.idusuario <> :eu AND (u.username ILIKE :padrao OR p.nomeexibicao ILIKE :padrao)
                 ORDER BY (LOWER(u.username) = LOWER(:termo)) DESC, LOWER(u.username) LIMIT 20
                """)
            .param("eu", eu).param("padrao", padrao).param("termo", termo)
            .query((rs, n) -> mapear(rs)).list();
    }
}
