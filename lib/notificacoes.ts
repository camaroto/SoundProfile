import { query } from "./db";

// Avisos de novos seguidores. Mensagens novas não viram linhas aqui: o contador de
// não lidas vem do estado de leitura da conversa (veja lib/mensagens.ts), o que
// evita um aviso para cada mensagem.
export type TipoNotificacao = "novo_seguidor";

// O índice parcial (idUsuario, tipo, idOrigem) WHERE lida = false impede repetição.
export async function criarNotificacao(idUsuario: number, tipo: TipoNotificacao, idOrigem: number): Promise<void> {
  await query(
    `INSERT INTO Notificacao (idUsuario, tipo, idOrigem) VALUES ($1, $2, $3)
     ON CONFLICT (idUsuario, tipo, idOrigem) WHERE lida = false DO NOTHING`,
    [idUsuario, tipo, idOrigem],
  );
}

export async function marcarLidaPorOrigem(idUsuario: number, tipo: TipoNotificacao, idOrigem: number): Promise<void> {
  await query(
    "UPDATE Notificacao SET lida = true WHERE idUsuario = $1 AND tipo = $2 AND idOrigem = $3 AND lida = false",
    [idUsuario, tipo, idOrigem],
  );
}

// Quando o pedido é cancelado, o aviso que ainda não foi lido some junto.
export async function apagarNaoLida(idUsuario: number, tipo: TipoNotificacao, idOrigem: number): Promise<void> {
  await query("DELETE FROM Notificacao WHERE idUsuario = $1 AND tipo = $2 AND idOrigem = $3 AND lida = false", [
    idUsuario,
    tipo,
    idOrigem,
  ]);
}

export async function marcarTodasLidas(idUsuario: number): Promise<void> {
  await query("UPDATE Notificacao SET lida = true WHERE idUsuario = $1 AND lida = false", [idUsuario]);
}

export async function contarNotificacoesNaoLidas(idUsuario: number): Promise<number> {
  const [l] = await query<{ total: number }>(
    "SELECT COUNT(*)::int AS total FROM Notificacao WHERE idUsuario = $1 AND lida = false AND tipo = 'novo_seguidor'",
    [idUsuario],
  );
  return l.total;
}

export type NotificacaoItem = {
  idNotificacao: number;
  tipo: TipoNotificacao;
  lida: boolean;
  criadaEm: Date;
  idOrigem: number;
  username: string;
  nomeExibicao: string | null;
  avatar: string | null;
  jaSigo: boolean; // eu já sigo quem gerou o aviso?
};

export async function listarNotificacoes(idUsuario: number, limite = 50): Promise<NotificacaoItem[]> {
  const l = await query<{
    idnotificacao: number; tipo: TipoNotificacao; lida: boolean; criadaem: Date; idorigem: number;
    username: string; nomeexibicao: string | null; avatar: string | null; jasigo: boolean;
  }>(
    `SELECT n.idNotificacao, n.tipo, n.lida, n.criadaEm, n.idOrigem, u.username, p.nomeExibicao, p.avatar,
            EXISTS (SELECT 1 FROM Seguidor s WHERE s.idSeguidor = n.idUsuario AND s.idSeguido = n.idOrigem) AS jaSigo
       FROM Notificacao n
       JOIN Usuario u ON u.idUsuario = n.idOrigem AND u.status = 'ativa'
       LEFT JOIN Perfil p ON p.idUsuario = u.idUsuario
      WHERE n.idUsuario = $1 AND n.tipo = 'novo_seguidor'
      ORDER BY n.criadaEm DESC, n.idNotificacao DESC LIMIT $2`,
    [idUsuario, limite],
  );
  return l.map((x) => ({
    idNotificacao: x.idnotificacao, tipo: x.tipo, lida: x.lida, criadaEm: x.criadaem, idOrigem: x.idorigem,
    username: x.username, nomeExibicao: x.nomeexibicao, avatar: x.avatar, jaSigo: x.jasigo,
  }));
}
