package br.edu.ifms.soundprofile.notificacao;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

/** Avisos do usuário (por ora, só "novo seguidor"; a API completa de notificações vem na próxima etapa). */
@Repository
public class NotificacaoRepository {

    public static final String NOVO_SEGUIDOR = "novo_seguidor";

    private final JdbcClient jdbc;

    public NotificacaoRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    /** O índice parcial (idusuario, tipo, idorigem) WHERE lida = false impede avisos repetidos. */
    public void criar(long idUsuario, String tipo, long idOrigem) {
        jdbc.sql("""
                INSERT INTO notificacao (idusuario, tipo, idorigem) VALUES (:usuario, :tipo, :origem)
                ON CONFLICT (idusuario, tipo, idorigem) WHERE lida = false DO NOTHING
                """)
            .param("usuario", idUsuario).param("tipo", tipo).param("origem", idOrigem).update();
    }

    public void apagarNaoLida(long idUsuario, String tipo, long idOrigem) {
        jdbc.sql("DELETE FROM notificacao WHERE idusuario = :usuario AND tipo = :tipo AND idorigem = :origem AND lida = false")
            .param("usuario", idUsuario).param("tipo", tipo).param("origem", idOrigem).update();
    }
}
