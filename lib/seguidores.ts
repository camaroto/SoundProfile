import { query } from "./db";
import { padraoBusca } from "./constantes";
import { apagarNaoLida, criarNotificacao } from "./notificacoes";

export class SeguirInvalidoError extends Error {}

// Freio contra automação: quantas pessoas alguém pode começar a seguir por hora.
const MAX_SEGUIDAS_POR_HORA = 100;

export type Relacao = { seguindo: boolean; meSegue: boolean };

export type UsuarioSocial = {
  idUsuario: number;
  username: string;
  nomeExibicao: string | null;
  avatar: string | null;
};

export type Pessoa = UsuarioSocial & Relacao & { desde: Date | null };

export async function relacaoCom(eu: number, outro: number): Promise<Relacao> {
  const [l] = await query<{ seguindo: boolean; mesegue: boolean }>(
    `SELECT EXISTS (SELECT 1 FROM Seguidor WHERE idSeguidor = $1 AND idSeguido = $2) AS seguindo,
            EXISTS (SELECT 1 FROM Seguidor WHERE idSeguidor = $2 AND idSeguido = $1) AS meSegue`,
    [eu, outro],
  );
  return { seguindo: l.seguindo, meSegue: l.mesegue };
}

// Seguir não precisa de aprovação. Repetir a ação não duplica nada (chave primária) nem
// gera um segundo aviso (índice de notificações não lidas).
export async function seguir(eu: number, outro: number): Promise<void> {
  if (eu === outro) throw new SeguirInvalidoError("Você não pode seguir a si mesmo.");

  const alvo = await query("SELECT 1 FROM Usuario WHERE idUsuario = $1 AND status = 'ativa'", [outro]);
  if (alvo.length === 0) throw new SeguirInvalidoError("Usuário não encontrado.");

  const [recentes] = await query<{ total: number }>(
    "SELECT COUNT(*)::int AS total FROM Seguidor WHERE idSeguidor = $1 AND criadoEm > now() - interval '1 hour'",
    [eu],
  );
  if (recentes.total >= MAX_SEGUIDAS_POR_HORA) {
    throw new SeguirInvalidoError("Você seguiu muitas pessoas em pouco tempo. Tente novamente mais tarde.");
  }

  const r = await query(
    "INSERT INTO Seguidor (idSeguidor, idSeguido) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING idSeguido",
    [eu, outro],
  );
  if (r.length > 0) await criarNotificacao(outro, "novo_seguidor", eu);
}

export async function deixarDeSeguir(eu: number, outro: number): Promise<void> {
  await query("DELETE FROM Seguidor WHERE idSeguidor = $1 AND idSeguido = $2", [eu, outro]);
  // Se o aviso ainda não tinha sido lido, ele some junto.
  await apagarNaoLida(outro, "novo_seguidor", eu);
}

export async function contagens(idUsuario: number): Promise<{ seguidores: number; seguindo: number }> {
  const [l] = await query<{ seguidores: number; seguindo: number }>(
    `SELECT (SELECT COUNT(*)::int FROM Seguidor s JOIN Usuario u ON u.idUsuario = s.idSeguidor AND u.status = 'ativa' WHERE s.idSeguido = $1) AS seguidores,
            (SELECT COUNT(*)::int FROM Seguidor s JOIN Usuario u ON u.idUsuario = s.idSeguido AND u.status = 'ativa' WHERE s.idSeguidor = $1) AS seguindo`,
    [idUsuario],
  );
  return l;
}

type Linha = {
  idusuario: number; username: string; nomeexibicao: string | null; avatar: string | null;
  desde: Date | null; seguindo: boolean; mesegue: boolean;
};
const paraPessoa = (x: Linha): Pessoa => ({
  idUsuario: x.idusuario, username: x.username, nomeExibicao: x.nomeexibicao, avatar: x.avatar,
  desde: x.desde, seguindo: x.seguindo, meSegue: x.mesegue,
});

// Quem eu sigo.
export async function listarSeguindo(eu: number, q?: string): Promise<Pessoa[]> {
  const busca = q?.trim() ? padraoBusca(q.trim().slice(0, 60)) : null;
  const l = await query<Linha>(
    `SELECT u.idUsuario, u.username, p.nomeExibicao, p.avatar, s.criadoEm AS desde, true AS seguindo,
            EXISTS (SELECT 1 FROM Seguidor r WHERE r.idSeguidor = u.idUsuario AND r.idSeguido = $1) AS meSegue
       FROM Seguidor s
       JOIN Usuario u ON u.idUsuario = s.idSeguido AND u.status = 'ativa'
       LEFT JOIN Perfil p ON p.idUsuario = u.idUsuario
      WHERE s.idSeguidor = $1 AND ($2::text IS NULL OR u.username ILIKE $2 OR p.nomeExibicao ILIKE $2)
      ORDER BY LOWER(COALESCE(p.nomeExibicao, u.username)) LIMIT 200`,
    [eu, busca],
  );
  return l.map(paraPessoa);
}

// Quem me segue.
export async function listarSeguidores(eu: number, q?: string): Promise<Pessoa[]> {
  const busca = q?.trim() ? padraoBusca(q.trim().slice(0, 60)) : null;
  const l = await query<Linha>(
    `SELECT u.idUsuario, u.username, p.nomeExibicao, p.avatar, s.criadoEm AS desde, true AS meSegue,
            EXISTS (SELECT 1 FROM Seguidor r WHERE r.idSeguidor = $1 AND r.idSeguido = u.idUsuario) AS seguindo
       FROM Seguidor s
       JOIN Usuario u ON u.idUsuario = s.idSeguidor AND u.status = 'ativa'
       LEFT JOIN Perfil p ON p.idUsuario = u.idUsuario
      WHERE s.idSeguido = $1 AND ($2::text IS NULL OR u.username ILIKE $2 OR p.nomeExibicao ILIKE $2)
      ORDER BY s.criadoEm DESC LIMIT 200`,
    [eu, busca],
  );
  return l.map(paraPessoa);
}

// Pesquisa por nome de exibição ou nome de usuário.
export async function buscarUsuarios(eu: number, q: string): Promise<Pessoa[]> {
  const termo = q.trim().slice(0, 60);
  if (!termo) return [];
  const l = await query<Linha>(
    `SELECT u.idUsuario, u.username, p.nomeExibicao, p.avatar, NULL::timestamptz AS desde,
            EXISTS (SELECT 1 FROM Seguidor r WHERE r.idSeguidor = $1 AND r.idSeguido = u.idUsuario) AS seguindo,
            EXISTS (SELECT 1 FROM Seguidor r WHERE r.idSeguidor = u.idUsuario AND r.idSeguido = $1) AS meSegue
       FROM Usuario u LEFT JOIN Perfil p ON p.idUsuario = u.idUsuario
      WHERE u.status = 'ativa' AND u.idUsuario <> $1 AND (u.username ILIKE $2 OR p.nomeExibicao ILIKE $2)
      ORDER BY (LOWER(u.username) = LOWER($3)) DESC, LOWER(u.username) LIMIT 20`,
    [eu, padraoBusca(termo), termo],
  );
  return l.map(paraPessoa);
}
