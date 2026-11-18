package br.edu.ifms.soundprofile.perfil;

import java.time.OffsetDateTime;
import java.util.Optional;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class PerfilRepository {

    private final JdbcClient jdbc;

    public PerfilRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public record PerfilDados(long idUsuario, String username, OffsetDateTime dataCadastro, String nomeExibicao,
                              String localizacao, String biografia, String avatar, String banner,
                              String moldura, String balao) {
    }

    public Optional<PerfilDados> buscarPorUsername(String username) {
        return jdbc.sql("""
                SELECT u.idusuario, u.username, u.datacadastro, p.nomeexibicao, p.localizacao, p.biografia,
                       p.avatar, p.banner, p.moldura, p.balao
                  FROM usuario u JOIN perfil p ON p.idusuario = u.idusuario
                 WHERE LOWER(u.username) = LOWER(:username) AND u.status = 'ativa'
                """)
            .param("username", username)
            .query((rs, n) -> new PerfilDados(rs.getLong("idusuario"), rs.getString("username"),
                rs.getObject("datacadastro", OffsetDateTime.class), rs.getString("nomeexibicao"),
                rs.getString("localizacao"), rs.getString("biografia"), rs.getString("avatar"),
                rs.getString("banner"), rs.getString("moldura"), rs.getString("balao")))
            .optional();
    }

    public void atualizarDados(long idUsuario, String nomeExibicao, String localizacao, String biografia) {
        jdbc.sql("UPDATE perfil SET nomeexibicao = :nome, localizacao = :loc, biografia = :bio WHERE idusuario = :id")
            .param("nome", nomeExibicao).param("loc", localizacao).param("bio", biografia).param("id", idUsuario)
            .update();
    }

    public void atualizarPersonalizacao(long idUsuario, String moldura, String balao) {
        jdbc.sql("UPDATE perfil SET moldura = :moldura, balao = :balao WHERE idusuario = :id")
            .param("moldura", moldura).param("balao", balao).param("id", idUsuario).update();
    }
}
