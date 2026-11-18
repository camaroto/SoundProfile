package br.edu.ifms.soundprofile.auth;

import br.edu.ifms.soundprofile.config.PropriedadesApp;
import br.edu.ifms.soundprofile.security.HashToken;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;

/** Cria e encerra sessões. O token vai ao cliente; o banco guarda só o hash dele. */
@Service
public class SessaoService {

    private final JdbcClient jdbc;
    private final int dias;
    private final SecureRandom aleatorio = new SecureRandom();

    public SessaoService(JdbcClient jdbc, PropriedadesApp props) {
        this.jdbc = jdbc;
        this.dias = props.sessaoDias();
    }

    public record NovaSessao(String token, Instant expiraEm) {
    }

    public NovaSessao criar(long idUsuario) {
        byte[] bytes = new byte[32];
        aleatorio.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        Instant expiraEm = Instant.now().plus(dias, ChronoUnit.DAYS);

        jdbc.sql("DELETE FROM sessao WHERE expiraem < now()").update();
        jdbc.sql("INSERT INTO sessao (idusuario, tokenhash, expiraem) VALUES (:id, :hash, :expira)")
            .param("id", idUsuario)
            .param("hash", HashToken.sha256(token))
            .param("expira", OffsetDateTime.ofInstant(expiraEm, ZoneOffset.UTC))
            .update();
        return new NovaSessao(token, expiraEm);
    }

    public void encerrar(String token) {
        jdbc.sql("DELETE FROM sessao WHERE tokenhash = :hash").param("hash", HashToken.sha256(token)).update();
    }
}
