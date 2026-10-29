import { query } from "./db";
import { padraoBusca, type TipoItem } from "./constantes";
import { ITEM_COLUNAS, ITEM_JOINS, type ItemRef } from "./avaliacoes";

export type Membro = {
  idUsuario: number;
  username: string;
  nomeExibicao: string | null;
  avatar: string | null;
  dataCadastro: Date;
  avaliacoes: number;
};

export async function listarMembros(o: { q?: string; ordem?: "recentes" | "ativos"; limite?: number } = {}): Promise<Membro[]> {
  const q = o.q?.trim() ? padraoBusca(o.q.trim()) : null;
  const ordem = o.ordem === "ativos" ? "avaliacoes DESC, u.dataCadastro DESC" : "u.dataCadastro DESC";
  const l = await query<{
    idusuario: number; username: string; nomeexibicao: string | null; avatar: string | null;
    datacadastro: Date; avaliacoes: number;
  }>(
    `SELECT u.idUsuario, u.username, p.nomeExibicao, p.avatar, u.dataCadastro,
            (SELECT COUNT(*)::int FROM Avaliacao a WHERE a.idUsuario = u.idUsuario) AS avaliacoes
       FROM Usuario u LEFT JOIN Perfil p ON p.idUsuario = u.idUsuario
      WHERE u.status = 'ativa' AND ($1::text IS NULL OR u.username ILIKE $1 OR p.nomeExibicao ILIKE $1)
      ORDER BY ${ordem} LIMIT $2`,
    [q, Math.min(o.limite ?? 24, 60)],
  );
  return l.map((x) => ({
    idUsuario: x.idusuario, username: x.username, nomeExibicao: x.nomeexibicao, avatar: x.avatar,
    dataCadastro: x.datacadastro, avaliacoes: x.avaliacoes,
  }));
}

export type AvaliacaoRecente = ItemRef & {
  idAvaliacao: number;
  nota: number;
  comentario: string;
  data: Date;
  username: string;
  nomeExibicao: string | null;
  avatar: string | null;
};

export async function avaliacoesRecentes(limite = 6, somenteComTexto = false): Promise<AvaliacaoRecente[]> {
  const l = await query<{
    idavaliacao: number; nota: number; comentario: string; criadaem: Date; username: string;
    nomeexibicao: string | null; avatar: string | null; tipo: TipoItem; titulo: string; slug: string;
    imagem: string | null; artista: string | null;
  }>(
    `SELECT a.idAvaliacao, a.nota::float8 AS nota, a.comentario, a.criadaEm, u.username, p.nomeExibicao, p.avatar,
            ${ITEM_COLUNAS("a")}
       FROM Avaliacao a JOIN Usuario u ON u.idUsuario = a.idUsuario LEFT JOIN Perfil p ON p.idUsuario = u.idUsuario
       ${ITEM_JOINS("a")}
      WHERE u.status = 'ativa' AND (NOT $2::boolean OR a.comentario <> '')
      ORDER BY a.criadaEm DESC LIMIT $1`,
    [limite, somenteComTexto],
  );
  return l.map((x) => ({
    idAvaliacao: x.idavaliacao, nota: x.nota, comentario: x.comentario, data: x.criadaem, username: x.username,
    nomeExibicao: x.nomeexibicao, avatar: x.avatar, tipo: x.tipo, titulo: x.titulo, slug: x.slug,
    imagem: x.imagem, artista: x.artista,
  }));
}
