
package br.edu.ifms.soundprofile.spotify;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class SpotifyRepository {

    private final JdbcClient jdbc;

    public SpotifyRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public long contarImportacoesRecentes(long idUsuario) {
        return jdbc.sql("""
                SELECT COUNT(*)
                FROM importacaospotify
                WHERE idusuario = :idUsuario
                  AND criadaem >= now() - interval '1 hour'
                """)
            .param("idUsuario", idUsuario)
            .query(Long.class)
            .single();
    }

    public long salvarArtista(String slug, String nome, String spotifyId) {
        return jdbc.sql("""
                INSERT INTO artista (slug, nome, spotifyid)
                VALUES (:slug, :nome, :spotifyId)
                ON CONFLICT (spotifyid)
                DO UPDATE SET nome = EXCLUDED.nome
                RETURNING idartista
                """)
            .param("slug", slug)
            .param("nome", nome)
            .param("spotifyId", spotifyId)
            .query(Long.class)
            .single();
    }

    public long salvarAlbum(
            String slug,
            String titulo,
            long idArtista,
            Integer ano,
            String capa,
            String spotifyId
    ) {
        return jdbc.sql("""
                INSERT INTO album (
                    slug, titulo, idartista, ano, capa, spotifyid
                )
                VALUES (
                    :slug, :titulo, :idArtista, :ano, :capa, :spotifyId
                )
                ON CONFLICT (spotifyid)
                DO UPDATE SET
                    titulo = EXCLUDED.titulo,
                    idartista = EXCLUDED.idartista,
                    ano = COALESCE(EXCLUDED.ano, album.ano),
                    capa = COALESCE(EXCLUDED.capa, album.capa)
                RETURNING idalbum
                """)
            .param("slug", slug)
            .param("titulo", titulo)
            .param("idArtista", idArtista)
            .param("ano", ano)
            .param("capa", capa)
            .param("spotifyId", spotifyId)
            .query(Long.class)
            .single();
    }

    public long salvarMusica(
            String slug,
            String titulo,
            long idArtista,
            Long idAlbum,
            Integer faixa,
            String spotifyId
    ) {
        return jdbc.sql("""
                INSERT INTO musica (
                    slug, titulo, idartista, idalbum, faixa, spotifyid
                )
                VALUES (
                    :slug, :titulo, :idArtista, :idAlbum, :faixa, :spotifyId
                )
                ON CONFLICT (spotifyid)
                DO UPDATE SET
                    titulo = EXCLUDED.titulo,
                    idartista = EXCLUDED.idartista,
                    idalbum = EXCLUDED.idalbum,
                    faixa = EXCLUDED.faixa
                RETURNING idmusica
                """)
            .param("slug", slug)
            .param("titulo", titulo)
            .param("idArtista", idArtista)
            .param("idAlbum", idAlbum)
            .param("faixa", faixa)
            .param("spotifyId", spotifyId)
            .query(Long.class)
            .single();
    }

    public void registrarImportacao(long idUsuario) {
        jdbc.sql("""
                INSERT INTO importacaospotify (idusuario)
                VALUES (:idUsuario)
                """)
            .param("idUsuario", idUsuario)
            .update();
    }
}
