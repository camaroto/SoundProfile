import { query } from "./db";
import { NOTAS_VALIDAS, inicioDoPeriodo, type Periodo } from "./constantes";

// Todas as estatísticas vêm das avaliações feitas no próprio SoundProfile.
const FUSO = "America/Sao_Paulo";

export type EstatisticasUsuario = {
  total: number;
  media: number | null;
  porTipo: { artista: number; album: number; musica: number };
  distribuicao: { rotulo: string; valor: number }[];
  serie: { rotulo: string; valor: number }[];
  generos: { slug: string; nome: string; total: number }[];
};

export async function estatisticasDoUsuario(idUsuario: number, periodo: Periodo): Promise<EstatisticasUsuario> {
  const desde = inicioDoPeriodo(periodo);

  const [resumo] = await query<{ total: number; media: number | null; artistas: number; albuns: number; musicas: number }>(
    `SELECT COUNT(*)::int AS total, AVG(nota)::float8 AS media,
            COUNT(idArtista)::int AS artistas, COUNT(idAlbum)::int AS albuns, COUNT(idMusica)::int AS musicas
       FROM Avaliacao WHERE idUsuario = $1 AND ($2::timestamptz IS NULL OR criadaEm >= $2)`,
    [idUsuario, desde],
  );

  const dist = await query<{ nota: string; qtd: number }>(
    `SELECT nota::text AS nota, COUNT(*)::int AS qtd FROM Avaliacao
      WHERE idUsuario = $1 AND ($2::timestamptz IS NULL OR criadaEm >= $2) GROUP BY nota`,
    [idUsuario, desde],
  );
  const mapa = new Map(dist.map((d) => [Number(d.nota), d.qtd]));

  // Série temporal: por dia (7 e 30 dias) ou por mês (histórico geral, últimos 12 meses).
  const serie =
    periodo === "tudo"
      ? await query<{ rotulo: string; valor: number }>(
          `SELECT to_char(m, 'MM/YY') AS rotulo, COALESCE(c.qtd, 0)::int AS valor
             FROM generate_series(date_trunc('month', now() AT TIME ZONE '${FUSO}') - interval '11 months',
                                  date_trunc('month', now() AT TIME ZONE '${FUSO}'), interval '1 month') m
             LEFT JOIN (SELECT date_trunc('month', criadaEm AT TIME ZONE '${FUSO}') AS mes, COUNT(*) AS qtd
                          FROM Avaliacao WHERE idUsuario = $1 GROUP BY 1) c ON c.mes = m
            ORDER BY m`,
          [idUsuario],
        )
      : await query<{ rotulo: string; valor: number }>(
          `SELECT to_char(d, 'DD/MM') AS rotulo, COALESCE(c.qtd, 0)::int AS valor
             FROM generate_series(((now() AT TIME ZONE '${FUSO}')::date - ($2::int - 1)),
                                  (now() AT TIME ZONE '${FUSO}')::date, interval '1 day') d
             LEFT JOIN (SELECT (criadaEm AT TIME ZONE '${FUSO}')::date AS dia, COUNT(*) AS qtd
                          FROM Avaliacao WHERE idUsuario = $1 GROUP BY 1) c ON c.dia = d::date
            ORDER BY d`,
          [idUsuario, periodo === "7d" ? 7 : 30],
        );

  // Gêneros: os do artista (álbuns e músicas herdam do artista).
  const generos = await query<{ slug: string; nome: string; total: number }>(
    `SELECT g.slug, g.nome, COUNT(*)::int AS total
       FROM Avaliacao a
       LEFT JOIN Album al ON al.idAlbum = a.idAlbum
       LEFT JOIN Musica mu ON mu.idMusica = a.idMusica
       JOIN ArtistaGenero ag ON ag.idArtista = COALESCE(a.idArtista, al.idArtista, mu.idArtista)
       JOIN Genero g ON g.idGenero = ag.idGenero
      WHERE a.idUsuario = $1 AND ($2::timestamptz IS NULL OR a.criadaEm >= $2)
      GROUP BY g.idGenero ORDER BY total DESC, g.nome LIMIT 6`,
    [idUsuario, desde],
  );

  return {
    total: resumo.total,
    media: resumo.media,
    porTipo: { artista: resumo.artistas, album: resumo.albuns, musica: resumo.musicas },
    distribuicao: NOTAS_VALIDAS.map((n) => ({ rotulo: String(n).replace(".", ","), valor: mapa.get(n) ?? 0 })),
    serie,
    generos,
  };
}

export async function totaisDoUsuario(idUsuario: number) {
  const [l] = await query<{ avaliacoes: number; favoritos: number; media: number | null; albuns: number }>(
    `SELECT (SELECT COUNT(*)::int FROM Avaliacao WHERE idUsuario = $1) AS avaliacoes,
            (SELECT COUNT(*)::int FROM Favorito WHERE idUsuario = $1) AS favoritos,
            (SELECT AVG(nota)::float8 FROM Avaliacao WHERE idUsuario = $1) AS media,
            (SELECT COUNT(idAlbum)::int FROM Avaliacao WHERE idUsuario = $1) AS albuns`,
    [idUsuario],
  );
  return l;
}

// Gêneros mais avaliados por um usuário (usado no painel de perfil do chat).
export async function generosDoUsuario(idUsuario: number, limite = 4) {
  return query<{ slug: string; nome: string; total: number }>(
    `SELECT g.slug, g.nome, COUNT(*)::int AS total
       FROM Avaliacao a
       LEFT JOIN Album al ON al.idAlbum = a.idAlbum
       LEFT JOIN Musica mu ON mu.idMusica = a.idMusica
       JOIN ArtistaGenero ag ON ag.idArtista = COALESCE(a.idArtista, al.idArtista, mu.idArtista)
       JOIN Genero g ON g.idGenero = ag.idGenero
      WHERE a.idUsuario = $1
      GROUP BY g.idGenero ORDER BY total DESC, g.nome LIMIT $2`,
    [idUsuario, limite],
  );
}
