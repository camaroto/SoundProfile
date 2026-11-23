package br.edu.ifms.soundprofile.auth;

import java.util.Optional;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class UsuarioRepository {

    private final JdbcClient jdbc;

    public UsuarioRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public record UsuarioParaLogin(long idUsuario, String username, String email, boolean emailVerificado,
                                   String senhaHash, String status, String role) {
    }

    public record Pendente(long idUsuario, String username, String email) {
    }

    public record ContaGoogle(long idUsuario, String status, String googleId) {
    }

    public Optional<ContaGoogle> buscarPorGoogleId(String sub) {
        return jdbc.sql("SELECT idusuario, status, googleid FROM usuario WHERE googleid = :sub")
            .param("sub", sub)
            .query((rs, n) -> new ContaGoogle(rs.getLong("idusuario"), rs.getString("status"), rs.getString("googleid")))
            .optional();
    }

    public Optional<ContaGoogle> buscarPorEmail(String email) {
        return jdbc.sql("SELECT idusuario, status, googleid FROM usuario WHERE LOWER(email) = LOWER(:email)")
            .param("email", email)
            .query((rs, n) -> new ContaGoogle(rs.getLong("idusuario"), rs.getString("status"), rs.getString("googleid")))
            .optional();
    }

    /** O Google confirmou que a pessoa é dona do e-mail, então a conta também passa a ser verificada. */
    public void vincularGoogle(long idUsuario, String sub) {
        jdbc.sql("UPDATE usuario SET googleid = :sub, emailverificado = true WHERE idusuario = :id")
            .param("sub", sub).param("id", idUsuario).update();
    }

    /** Conta criada pelo Google: já nasce verificada. Deve rodar dentro de uma transação. */
    public long criarComGoogle(String username, String email, String senhaHash, String googleId, String nomeExibicao) {
        long id = jdbc.sql("""
                INSERT INTO usuario (username, email, senhahash, emailverificado, googleid)
                VALUES (:username, :email, :senha, true, :google) RETURNING idusuario
                """)
            .param("username", username).param("email", email).param("senha", senhaHash).param("google", googleId)
            .query(Long.class).single();
        jdbc.sql("INSERT INTO perfil (idusuario, nomeexibicao) VALUES (:id, :nome)")
            .param("id", id).param("nome", nomeExibicao).update();
        return id;
    }

    public boolean existeEmail(String email) {
        return jdbc.sql("SELECT EXISTS (SELECT 1 FROM usuario WHERE LOWER(email) = LOWER(:email))")
            .param("email", email).query(Boolean.class).single();
    }

    public boolean existeUsername(String username) {
        return jdbc.sql("SELECT EXISTS (SELECT 1 FROM usuario WHERE LOWER(username) = LOWER(:username))")
            .param("username", username).query(Boolean.class).single();
    }

    /** Cria o usuário e o perfil vazio. Deve rodar dentro de uma transação (feita no AuthService). */
    public long criar(String username, String email, String senhaHash, boolean emailVerificado) {
        long id = jdbc.sql("""
                INSERT INTO usuario (username, email, senhahash, emailverificado)
                VALUES (:username, :email, :senha, :verificado) RETURNING idusuario
                """)
            .param("username", username).param("email", email)
            .param("senha", senhaHash).param("verificado", emailVerificado)
            .query(Long.class).single();
        jdbc.sql("INSERT INTO perfil (idusuario) VALUES (:id)").param("id", id).update();
        return id;
    }

    /** Aceita o nome de usuário ou o e-mail. */
    public Optional<UsuarioParaLogin> buscarParaLogin(String identificador) {
        return jdbc.sql("""
                SELECT idusuario, username, email, emailverificado, senhahash, status, role
                  FROM usuario
                 WHERE LOWER(username) = LOWER(:id) OR LOWER(email) = LOWER(:id)
                 LIMIT 1
                """)
            .param("id", identificador)
            .query((rs, n) -> new UsuarioParaLogin(rs.getLong("idusuario"), rs.getString("username"),
                rs.getString("email"), rs.getBoolean("emailverificado"), rs.getString("senhahash"),
                rs.getString("status"), rs.getString("role")))
            .optional();
    }

    /**
     * Cadastros que nunca confirmaram o e-mail não têm conteúdo nem conseguem entrar, então podem
     * ser descartados quando outra pessoa usa o mesmo e-mail (ou um username parado há mais de 15 min).
     */
    public void liberarPendentes(String email, String username) {
        jdbc.sql("""
                DELETE FROM usuario
                 WHERE emailverificado = false
                   AND (LOWER(email) = LOWER(:email)
                        OR (LOWER(username) = LOWER(:username) AND datacadastro < now() - interval '15 minutes'))
                """)
            .param("email", email).param("username", username).update();
    }

    public Optional<Pendente> buscarPendentePorEmail(String email) {
        return jdbc.sql("""
                SELECT idusuario, username, email FROM usuario
                 WHERE LOWER(email) = LOWER(:email) AND emailverificado = false AND status = 'ativa'
                """)
            .param("email", email)
            .query((rs, n) -> new Pendente(rs.getLong("idusuario"), rs.getString("username"), rs.getString("email")))
            .optional();
    }

    public void excluir(long idUsuario) {
        jdbc.sql("DELETE FROM usuario WHERE idusuario = :id").param("id", idUsuario).update();
    }

    public Optional<br.edu.ifms.soundprofile.security.UsuarioLogado> buscarResumo(long idUsuario) {
        return jdbc.sql("""
                SELECT u.idusuario, u.username, u.role, p.avatar
                  FROM usuario u LEFT JOIN perfil p ON p.idusuario = u.idusuario
                 WHERE u.idusuario = :id
                """)
            .param("id", idUsuario)
            .query((rs, n) -> new br.edu.ifms.soundprofile.security.UsuarioLogado(rs.getLong("idusuario"),
                rs.getString("username"), rs.getString("role"), rs.getString("avatar")))
            .optional();
    }
}
