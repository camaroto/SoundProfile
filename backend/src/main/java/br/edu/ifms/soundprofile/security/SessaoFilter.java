package br.edu.ifms.soundprofile.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Lê "Authorization: Bearer TOKEN", confere o hash na tabela Sessao e, se a sessão for válida,
 * autentica a requisição. Sem token (ou com token inválido) a requisição segue como anônima;
 * quem decide se isso é permitido é o SecurityConfig.
 */
public class SessaoFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(SessaoFilter.class);
    private static final String PREFIXO = "Bearer ";

    private final JdbcClient jdbc;

    public SessaoFilter(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public static String lerToken(HttpServletRequest req) {
        String cabecalho = req.getHeader("Authorization");
        if (cabecalho == null || !cabecalho.startsWith(PREFIXO)) return null;
        String token = cabecalho.substring(PREFIXO.length()).trim();
        return token.isEmpty() || token.length() > 200 ? null : token;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain cadeia)
        throws ServletException, IOException {
        String token = lerToken(req);
        if (token != null) {
            try {
                jdbc.sql("""
                        SELECT u.idusuario, u.username, u.role, p.avatar
                          FROM sessao s
                          JOIN usuario u ON u.idusuario = s.idusuario
                          LEFT JOIN perfil p ON p.idusuario = u.idusuario
                         WHERE s.tokenhash = :hash AND s.expiraem > now() AND u.status = 'ativa'
                        """)
                    .param("hash", HashToken.sha256(token))
                    .query((rs, n) -> new UsuarioLogado(rs.getLong("idusuario"), rs.getString("username"),
                        rs.getString("role"), rs.getString("avatar")))
                    .optional()
                    .ifPresent(u -> SecurityContextHolder.getContext().setAuthentication(
                        new UsernamePasswordAuthenticationToken(u, null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + u.role().toUpperCase())))));
            } catch (DataAccessException e) {
                // Banco fora do ar não derruba a API inteira: a requisição segue como anônima.
                log.error("Falha ao ler a sessão", e);
            }
        }
        cadeia.doFilter(req, res);
    }
}
