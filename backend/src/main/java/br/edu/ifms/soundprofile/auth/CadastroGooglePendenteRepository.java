
package br.edu.ifms.soundprofile.auth;

import java.time.Instant;
import java.util.Optional;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class CadastroGooglePendenteRepository {

    private final JdbcClient jdbc;

    public CadastroGooglePendenteRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public record CadastroPendente(
            String googleId,
            String email,
            String nomeExibicao,
            Instant expiraEm) {
    }

    public void salvar(
            String tokenHash,
            String googleId,
            String email,
            String nomeExibicao,
            Instant expiraEm) {
        jdbc.sql("""
                INSERT INTO cadastrogooglependente
                    (tokenhash, googleid, email, nomeexibicao, expiraem)
                VALUES
                    (:token, :google, :email, :nome, :expira)
                """)
                .param("token", tokenHash)
                .param("google", googleId)
                .param("email", email)
                .param("nome", nomeExibicao)
                .param("expira", java.sql.Timestamp.from(expiraEm))
                .update();
    }

    public Optional<CadastroPendente> buscarValido(String tokenHash) {
        return jdbc.sql("""
                SELECT googleid, email, nomeexibicao, expiraem
                  FROM cadastrogooglependente
                 WHERE tokenhash = :token
                   AND expiraem > now()
                """)
                .param("token", tokenHash)
                .query((rs, n) -> new CadastroPendente(
                        rs.getString("googleid"),
                        rs.getString("email"),
                        rs.getString("nomeexibicao"),
                        rs.getTimestamp("expiraem").toInstant()))
                .optional();
    }

    public boolean consumir(String tokenHash) {
        int removidos = jdbc.sql("""
                DELETE FROM cadastrogooglependente
                 WHERE tokenhash = :token
                   AND expiraem > now()
                """)
                .param("token", tokenHash)
                .update();

        return removidos == 1;
    }

    public void excluirExpirados() {
        jdbc.sql("DELETE FROM cadastrogooglependente WHERE expiraem <= now()")
                .update();
    }
}
