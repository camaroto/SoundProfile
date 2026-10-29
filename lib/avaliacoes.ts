import { query } from "./db";
import { COLUNA, NOTAS_VALIDAS, MINIMO_PARA_MEDIA, inicioDoPeriodo, type Periodo, type TipoItem } from "./constantes";

// Trechos de SQL que descobrem "de que item é esta linha" (artista, álbum ou música).
// `t` é o alias da tabela que tem as colunas idArtista/idAlbum/idMusica.
export const ITEM_COLUNAS = (t: string) => `
  CASE WHEN ${t}.idAlbum IS NOT NULL THEN 'album' WHEN ${t}.idArtista IS NOT NULL THEN 'artista' ELSE 'musica' END AS tipo,
  COALESCE(al.titulo, ar.nome, mu.titulo) AS titulo,
  COALESCE(al.slug, ar.slug, mu.slug) AS slug,
  COALESCE(al.capa, ar.imagem, mal.capa) AS imagem,
  COALESCE(aral.nome, muar.nome) AS artista`;
export const ITEM_JOINS = (t: string) => `
  LEFT JOIN Album al ON al.idAlbum = ${t}.idAlbum
  LEFT JOIN Artista aral ON aral.idArtista = al.idArtista
  LEFT JOIN Artista ar ON ar.idArtista = ${t}.idArtista
  LEFT JOIN Musica mu ON mu.idMusica = ${t}.idMusica
  LEFT JOIN Artista muar ON muar.idArtista = mu.idArtista
  LEFT JOIN Album mal ON mal.idAlbum = mu.idAlbum`;

export type ItemRef = {
  tipo: TipoItem;
  titulo: string;
  slug: string;
  imagem: string | null;
  artista: string | null;
};

export class AvaliacaoInvalidaError extends Error {}

export function validarNota(valor: unknown): number {
  const nota = Number(valor);
  if (!NOTAS_VALIDAS.includes(nota)) {
    throw new AvaliacaoInvalidaError("Escolha uma nota de 0,5 a 5.");
  }
  return nota;
}

export type MinhaAvaliacao = { idAvaliacao: number; nota: number; comentario: string };

export async function minhaAvaliacao(idUsuario: number, tipo: TipoItem, idItem: number): Promise<MinhaAvaliacao | null> {
  const col = COLUNA[tipo];
  const l = await query<{ idavaliacao: number; nota: number; comentario: string }>(
    `SELECT idAvaliacao, nota::float8 AS nota, comentario FROM Avaliacao WHERE idUsuario = $1 AND ${col} = $2`,
    [idUsuario, idItem],
  );
  return l[0] ? { idAvaliacao: l[0].idavaliacao, nota: l[0].nota, comentario: l[0].comentario } : null;
}

// RN03: uma avaliação por usuário e por item; avaliar de novo edita a anterior.
export async function salvarAvaliacao(idUsuario: number, tipo: TipoItem, idItem: number, nota: number, comentario: string) {
  const col = COLUNA[tipo];
  try {
    await query(
      `INSERT INTO Avaliacao (idUsuario, ${col}, nota, comentario) VALUES ($1, $2, $3, $4)
       ON CONFLICT (idUsuario, ${col}) WHERE ${col} IS NOT NULL
       DO UPDATE SET nota = EXCLUDED.nota, comentario = EXCLUDED.comentario, atualizadaEm = now()`,
      [idUsuario, idItem, nota, comentario],
    );
  } catch (erro) {
    if ((erro as { code?: string }).code === "23503") {
      throw new AvaliacaoInvalidaError("Este item não existe mais.");
    }
    throw erro;
  }
}

// O dono apaga a própria avaliação; o administrador pode apagar qualquer uma (UC12).
export async function removerAvaliacao(idAvaliacao: number, idUsuario: number, admin: boolean): Promise<boolean> {
  const r = await query(
    `DELETE FROM Avaliacao WHERE idAvaliacao = $1 AND ($3::boolean OR idUsuario = $2) RETURNING 1`,
    [idAvaliacao, idUsuario, admin],
  );
  return r.length > 0;
}

export async function alternarCurtida(idAvaliacao: number, idUsuario: number): Promise<void> {
  const removida = await query(
    "DELETE FROM CurtidaAvaliacao WHERE idAvaliacao = $1 AND idUsuario = $2 RETURNING 1",
    [idAvaliacao, idUsuario],
  );
  if (removida.length === 0) {
    await query(
      `INSERT INTO CurtidaAvaliacao (idAvaliacao, idUsuario)
       SELECT $1, $2 WHERE EXISTS (SELECT 1 FROM Avaliacao WHERE idAvaliacao = $1)
       ON CONFLICT DO NOTHING`,
      [idAvaliacao, idUsuario],
    );
  }
}

export type EstatisticasItem = {
  media: number | null;
  total: number;
  minimo: number;
  distribuicao: { nota: number; qtd: number }[]; // 0,5 a 5
};

export async function estatisticasItem(tipo: TipoItem, idItem: number): Promise<EstatisticasItem> {
  const col = COLUNA[tipo];
  const linhas = await query<{ nota: string; qtd: number }>(
    `SELECT nota::text AS nota, COUNT(*)::int AS qtd FROM Avaliacao WHERE ${col} = $1 GROUP BY nota`,
    [idItem],
  );
  const mapa = new Map(linhas.map((l) => [Number(l.nota), l.qtd]));
  const distribuicao = NOTAS_VALIDAS.map((nota) => ({ nota, qtd: mapa.get(nota) ?? 0 }));
  const total = distribuicao.reduce((s, d) => s + d.qtd, 0);
  const soma = distribuicao.reduce((s, d) => s + d.nota * d.qtd, 0);
  return {
    media: total >= MINIMO_PARA_MEDIA ? soma / total : null,
    total,
    minimo: MINIMO_PARA_MEDIA,
    distribuicao,
  };
}

export type AvaliacaoPublica = {
  idAvaliacao: number;
  idUsuario: number;
  username: string;
  nomeExibicao: string | null;
  avatar: string | null;
  nota: number;
  comentario: string;
  data: Date;
  curtidas: number;
  curtiu: boolean;
};

export async function avaliacoesDoItem(tipo: TipoItem, idItem: number, idUsuarioAtual: number | null, limite = 30): Promise<AvaliacaoPublica[]> {
  const col = COLUNA[tipo];
  const l = await query<{
    idavaliacao: number; idusuario: number; username: string; nomeexibicao: string | null; avatar: string | null;
    nota: number; comentario: string; criadaem: Date; curtidas: number; curtiu: boolean;
  }>(
    `SELECT a.idAvaliacao, a.idUsuario, u.username, p.nomeExibicao, p.avatar, a.nota::float8 AS nota,
            a.comentario, a.criadaEm,
            (SELECT COUNT(*)::int FROM CurtidaAvaliacao c WHERE c.idAvaliacao = a.idAvaliacao) AS curtidas,
            EXISTS (SELECT 1 FROM CurtidaAvaliacao c WHERE c.idAvaliacao = a.idAvaliacao AND c.idUsuario = $2::int) AS curtiu
       FROM Avaliacao a JOIN Usuario u ON u.idUsuario = a.idUsuario LEFT JOIN Perfil p ON p.idUsuario = u.idUsuario
      WHERE a.${col} = $1 AND u.status = 'ativa'
      ORDER BY (a.comentario <> '') DESC, curtidas DESC, a.criadaEm DESC LIMIT $3`,
    [idItem, idUsuarioAtual, limite],
  );
  return l.map((x) => ({
    idAvaliacao: x.idavaliacao, idUsuario: x.idusuario, username: x.username, nomeExibicao: x.nomeexibicao,
    avatar: x.avatar, nota: x.nota, comentario: x.comentario, data: x.criadaem, curtidas: x.curtidas, curtiu: x.curtiu,
  }));
}

// ===== Favoritos =====

export async function ehFavorito(idUsuario: number, tipo: TipoItem, idItem: number): Promise<boolean> {
  const col = COLUNA[tipo];
  const l = await query(`SELECT 1 FROM Favorito WHERE idUsuario = $1 AND ${col} = $2`, [idUsuario, idItem]);
  return l.length > 0;
}

export async function alternarFavorito(idUsuario: number, tipo: TipoItem, idItem: number): Promise<void> {
  const col = COLUNA[tipo];
  const removido = await query(`DELETE FROM Favorito WHERE idUsuario = $1 AND ${col} = $2 RETURNING 1`, [idUsuario, idItem]);
  if (removido.length > 0) return;
  try {
    await query(
      `INSERT INTO Favorito (idUsuario, ${col}) VALUES ($1, $2)
       ON CONFLICT (idUsuario, ${col}) WHERE ${col} IS NOT NULL DO NOTHING`,
      [idUsuario, idItem],
    );
  } catch (erro) {
    if ((erro as { code?: string }).code !== "23503") throw erro;
  }
}

export async function favoritosDoUsuario(idUsuario: number, limite = 60): Promise<ItemRef[]> {
  const l = await query<ItemRef>(
    `SELECT ${ITEM_COLUNAS("f")} FROM Favorito f ${ITEM_JOINS("f")}
      WHERE f.idUsuario = $1 ORDER BY f.criadoEm DESC LIMIT $2`,
    [idUsuario, limite],
  );
  return l;
}

// ===== Avaliações de um usuário (perfil) =====

export type AvaliacaoDoUsuario = ItemRef & {
  idAvaliacao: number;
  nota: number;
  comentario: string;
  data: Date;
};

export async function avaliacoesDoUsuario(
  idUsuario: number,
  periodo: Periodo = "tudo",
  opcoes: { ordem?: "recentes" | "notas"; limite?: number } = {},
): Promise<AvaliacaoDoUsuario[]> {
  const ordem = opcoes.ordem === "notas" ? "a.nota DESC, a.criadaEm DESC" : "a.criadaEm DESC";
  const l = await query<{
    idavaliacao: number; nota: number; comentario: string; criadaem: Date;
    tipo: TipoItem; titulo: string; slug: string; imagem: string | null; artista: string | null;
  }>(
    `SELECT a.idAvaliacao, a.nota::float8 AS nota, a.comentario, a.criadaEm, ${ITEM_COLUNAS("a")}
       FROM Avaliacao a ${ITEM_JOINS("a")}
      WHERE a.idUsuario = $1 AND ($2::timestamptz IS NULL OR a.criadaEm >= $2)
      ORDER BY ${ordem} LIMIT $3`,
    [idUsuario, inicioDoPeriodo(periodo), opcoes.limite ?? 100],
  );
  return l.map((x) => ({
    idAvaliacao: x.idavaliacao, nota: x.nota, comentario: x.comentario, data: x.criadaem,
    tipo: x.tipo, titulo: x.titulo, slug: x.slug, imagem: x.imagem, artista: x.artista,
  }));
}
