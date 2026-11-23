
package br.edu.ifms.soundprofile.spotify;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

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

    public record ArtistaPendente(long idArtista, String spotifyId, String nome, String tituloFaixa) {
    }

    public Optional<String> slugDaMusica(String spotifyId) {
        return jdbc.sql("SELECT slug FROM musica WHERE spotifyid = :spotifyId")
            .param("spotifyId", spotifyId)
            .query(String.class)
            .optional();
    }

    /** O artista já tem foto e ao menos um gênero? Se tiver, não precisa consultar de novo. */
    public boolean artistaCompleto(long idArtista) {
        return jdbc.sql("""
                SELECT a.imagem IS NOT NULL
                       AND EXISTS (SELECT 1 FROM artistagenero ag WHERE ag.idartista = a.idartista)
                  FROM artista a WHERE a.idartista = :id
                """)
            .param("id", idArtista)
            .query(Boolean.class)
            .single();
    }

    public void atualizarImagemArtista(long idArtista, String imagem) {
        if (imagem == null || imagem.isBlank()) {
            return;
        }
        jdbc.sql("UPDATE artista SET imagem = COALESCE(imagem, :imagem) WHERE idartista = :id")
            .param("imagem", imagem)
            .param("id", idArtista)
            .update();
    }

    public void vincularGeneros(long idArtista, Collection<String> slugs) {
        for (String slug : slugs) {
            jdbc.sql("""
                    INSERT INTO artistagenero (idartista, idgenero)
                    SELECT :idArtista, idgenero FROM genero WHERE slug = :slug
                    ON CONFLICT DO NOTHING
                    """)
                .param("idArtista", idArtista)
                .param("slug", slug)
                .update();
        }
    }

    public long contarDestaques() {
        return jdbc.sql("SELECT COUNT(*) FROM musica WHERE destaque")
            .query(Long.class)
            .single();
    }

    public void marcarDestaque(String spotifyId, int ordem) {
        jdbc.sql("UPDATE musica SET destaque = true, destaqueordem = :ordem WHERE spotifyid = :spotifyId")
            .param("ordem", ordem)
            .param("spotifyId", spotifyId)
            .update();
    }

    /** Artistas importados sem foto ou sem gênero (os importados antes desta atualização). */
    public List<ArtistaPendente> artistasPendentes(int limite) {
        return jdbc.sql("""
                SELECT a.idartista, a.spotifyid, a.nome,
                       (SELECT m.titulo FROM musica m WHERE m.idartista = a.idartista
                         ORDER BY m.idmusica LIMIT 1) AS titulo_faixa
                  FROM artista a
                 WHERE a.spotifyid IS NOT NULL
                   AND (a.imagem IS NULL
                        OR NOT EXISTS (SELECT 1 FROM artistagenero ag WHERE ag.idartista = a.idartista))
                 ORDER BY a.idartista
                 LIMIT :limite
                """)
            .param("limite", limite)
            .query((rs, n) -> new ArtistaPendente(rs.getLong("idartista"), rs.getString("spotifyid"),
                rs.getString("nome"), rs.getString("titulo_faixa")))
            .list();
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
