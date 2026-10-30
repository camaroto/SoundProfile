import { query, transacao } from "./db";
import { padraoBusca } from "./constantes";
import { MAX_TEXTO_MENSAGEM, type MensagemDto } from "./mensagens-tipos";

export class MensagemInvalidaError extends Error {}

// Freio simples contra spam: mensagens por usuário a cada minuto.
const LIMITE_POR_MINUTO = 30;

// Remove caracteres de controle (o PostgreSQL rejeita o NUL), padroniza quebras de
// linha e apara as pontas. O texto é sempre exibido como texto puro, nunca como HTML.
export function normalizarTexto(bruto: string): string {
  const limpo = Array.from(bruto.replace(/\r\n?/g, "\n"))
    .filter((c) => {
      const n = c.codePointAt(0) ?? 0;
      return n === 10 || n === 9 || (n >= 32 && n !== 127);
    })
    .join("");
  return limpo.trim();
}

const paraDto = (x: { idmensagem: number; idautor: number; texto: string; enviadaem: Date }): MensagemDto => ({
  idMensagem: x.idmensagem,
  idAutor: x.idautor,
  texto: x.texto,
  enviadaEm: x.enviadaem.toISOString(),
});

export type ConversaAberta = {
  idConversa: number;
  outro: { idUsuario: number; username: string; nomeExibicao: string | null; avatar: string | null; ativo: boolean };
  lidaAte: number;
  limpaAte: number;
};

// Controle de acesso: só devolve a conversa se o usuário for participante.
export async function carregarConversa(eu: number, idConversa: number): Promise<ConversaAberta | null> {
  const l = await query<{
    idconversa: number; idoutro: number; username: string; status: string;
    nomeexibicao: string | null; avatar: string | null; lidaate: number; limpaate: number;
  }>(
    `SELECT c.idConversa, u.idUsuario AS idOutro, u.username, u.status, p.nomeExibicao, p.avatar, pc.lidaAte, pc.limpaAte
       FROM Conversa c
       JOIN ParticipanteConversa pc ON pc.idConversa = c.idConversa AND pc.idUsuario = $2
       JOIN Usuario u ON u.idUsuario = CASE WHEN c.idUsuarioA = $2 THEN c.idUsuarioB ELSE c.idUsuarioA END
       LEFT JOIN Perfil p ON p.idUsuario = u.idUsuario
      WHERE c.idConversa = $1`,
    [idConversa, eu],
  );
  const x = l[0];
  if (!x) return null;
  return {
    idConversa: x.idconversa,
    outro: { idUsuario: x.idoutro, username: x.username, nomeExibicao: x.nomeexibicao, avatar: x.avatar, ativo: x.status === "ativa" },
    lidaAte: x.lidaate,
    limpaAte: x.limpaate,
  };
}

// Abre a conversa com outro usuário, criando-a se ainda não existir (uma por par).
export async function obterOuCriarConversa(eu: number, outro: number): Promise<number> {
  if (eu === outro) throw new MensagemInvalidaError("Você não pode conversar consigo mesmo.");

  const alvo = await query("SELECT 1 FROM Usuario WHERE idUsuario = $1 AND status = 'ativa'", [outro]);
  if (alvo.length === 0) throw new MensagemInvalidaError("Usuário não encontrado.");

  const a = Math.min(eu, outro);
  const b = Math.max(eu, outro);
  return transacao(async (client) => {
    await client.query(
      "INSERT INTO Conversa (idUsuarioA, idUsuarioB) VALUES ($1, $2) ON CONFLICT (idUsuarioA, idUsuarioB) DO NOTHING",
      [a, b],
    );
    const r = await client.query<{ idconversa: number }>(
      "SELECT idConversa FROM Conversa WHERE idUsuarioA = $1 AND idUsuarioB = $2",
      [a, b],
    );
    const idConversa = r.rows[0].idconversa;
    await client.query(
      `INSERT INTO ParticipanteConversa (idConversa, idUsuario) VALUES ($1, $2), ($1, $3)
       ON CONFLICT (idConversa, idUsuario) DO NOTHING`,
      [idConversa, a, b],
    );
    return idConversa;
  });
}

export type ResumoConversa = {
  idConversa: number;
  outro: { idUsuario: number; username: string; nomeExibicao: string | null; avatar: string | null };
  ultimaTexto: string;
  ultimaEm: Date;
  ultimaPropria: boolean;
  naoLidas: number;
};

// Conversas da lista lateral: só as que têm mensagens que o usuário ainda não apagou.
export async function listarConversas(eu: number, q?: string): Promise<ResumoConversa[]> {
  const busca = q?.trim() ? padraoBusca(q.trim().slice(0, 60)) : null;
  const l = await query<{
    idconversa: number; idoutro: number; username: string; nomeexibicao: string | null; avatar: string | null;
    ultimotexto: string; ultimaem: Date; ultimoautor: number; naolidas: number;
  }>(
    `SELECT c.idConversa, u.idUsuario AS idOutro, u.username, p.nomeExibicao, p.avatar,
            m.texto AS ultimoTexto, m.enviadaEm AS ultimaEm, m.idAutor AS ultimoAutor,
            (SELECT COUNT(*)::int FROM Mensagem x
              WHERE x.idConversa = c.idConversa AND x.idAutor <> $1
                AND x.idMensagem > GREATEST(pc.lidaAte, pc.limpaAte)) AS naoLidas
       FROM ParticipanteConversa pc
       JOIN Conversa c ON c.idConversa = pc.idConversa
       JOIN Usuario u ON u.idUsuario = CASE WHEN c.idUsuarioA = $1 THEN c.idUsuarioB ELSE c.idUsuarioA END
       LEFT JOIN Perfil p ON p.idUsuario = u.idUsuario
       JOIN LATERAL (
         SELECT idMensagem, texto, enviadaEm, idAutor FROM Mensagem
          WHERE idConversa = c.idConversa AND idMensagem > pc.limpaAte
          ORDER BY idMensagem DESC LIMIT 1
       ) m ON true
      WHERE pc.idUsuario = $1 AND u.status = 'ativa'
        AND ($2::text IS NULL OR u.username ILIKE $2 OR p.nomeExibicao ILIKE $2)
      ORDER BY m.idMensagem DESC LIMIT 100`,
    [eu, busca],
  );
  return l.map((x) => ({
    idConversa: x.idconversa,
    outro: { idUsuario: x.idoutro, username: x.username, nomeExibicao: x.nomeexibicao, avatar: x.avatar },
    ultimaTexto: x.ultimotexto,
    ultimaEm: x.ultimaem,
    ultimaPropria: x.ultimoautor === eu,
    naoLidas: x.naolidas,
  }));
}

// depois: só mensagens mais novas que esse id (usado pela atualização automática).
// antes: só mensagens mais antigas (botão "carregar anteriores").
export async function listarMensagens(
  eu: number,
  idConversa: number,
  o: { depois?: number; antes?: number; limite?: number } = {},
): Promise<{ mensagens: MensagemDto[]; temMais: boolean }> {
  const limite = Math.min(Math.max(o.limite ?? 50, 1), 100);
  type Linha = { idmensagem: number; idautor: number; texto: string; enviadaem: Date };

  if (o.depois !== undefined) {
    const l = await query<Linha>(
      `SELECT m.idMensagem, m.idAutor, m.texto, m.enviadaEm
         FROM Mensagem m JOIN ParticipanteConversa pc ON pc.idConversa = m.idConversa AND pc.idUsuario = $1
        WHERE m.idConversa = $2 AND m.idMensagem > GREATEST(pc.limpaAte, $3::int)
        ORDER BY m.idMensagem ASC LIMIT $4`,
      [eu, idConversa, o.depois, limite],
    );
    return { mensagens: l.map(paraDto), temMais: false };
  }

  const l = await query<Linha>(
    `SELECT m.idMensagem, m.idAutor, m.texto, m.enviadaEm
       FROM Mensagem m JOIN ParticipanteConversa pc ON pc.idConversa = m.idConversa AND pc.idUsuario = $1
      WHERE m.idConversa = $2 AND m.idMensagem > pc.limpaAte AND ($3::int IS NULL OR m.idMensagem < $3)
      ORDER BY m.idMensagem DESC LIMIT $4`,
    [eu, idConversa, o.antes ?? null, limite + 1],
  );
  const temMais = l.length > limite;
  return { mensagens: l.slice(0, limite).reverse().map(paraDto), temMais };
}

export async function enviarMensagem(eu: number, idConversa: number, textoBruto: string): Promise<MensagemDto> {
  const texto = normalizarTexto(textoBruto);
  if (!texto) throw new MensagemInvalidaError("Escreva uma mensagem antes de enviar.");
  if (Array.from(texto).length > MAX_TEXTO_MENSAGEM) {
    throw new MensagemInvalidaError(`A mensagem pode ter no máximo ${MAX_TEXTO_MENSAGEM} caracteres.`);
  }

  const conversa = await carregarConversa(eu, idConversa);
  if (!conversa) throw new MensagemInvalidaError("Conversa não encontrada.");
  if (!conversa.outro.ativo) throw new MensagemInvalidaError("Este usuário não está mais disponível.");

  const [recentes] = await query<{ total: number }>(
    "SELECT COUNT(*)::int AS total FROM Mensagem WHERE idAutor = $1 AND enviadaEm > now() - interval '1 minute'",
    [eu],
  );
  if (recentes.total >= LIMITE_POR_MINUTO) {
    throw new MensagemInvalidaError("Você está enviando mensagens rápido demais. Aguarde um instante.");
  }

  const [nova] = await query<{ idmensagem: number; idautor: number; texto: string; enviadaem: Date }>(
    "INSERT INTO Mensagem (idConversa, idAutor, texto) VALUES ($1, $2, $3) RETURNING idMensagem, idAutor, texto, enviadaEm",
    [idConversa, eu, texto],
  );
  // Quem envia já "leu" a própria mensagem.
  await query(
    "UPDATE ParticipanteConversa SET lidaAte = GREATEST(lidaAte, $3) WHERE idConversa = $1 AND idUsuario = $2",
    [idConversa, eu, nova.idmensagem],
  );
  return paraDto(nova);
}

export async function marcarComoLida(eu: number, idConversa: number): Promise<void> {
  await query(
    `UPDATE ParticipanteConversa
        SET lidaAte = GREATEST(lidaAte, (SELECT COALESCE(MAX(idMensagem), 0) FROM Mensagem WHERE idConversa = $1))
      WHERE idConversa = $1 AND idUsuario = $2`,
    [idConversa, eu],
  );
}

// "Excluir conversa" para mim: esconde o histórico até agora da MINHA lista.
// O histórico do outro usuário não é tocado.
export async function limparConversa(eu: number, idConversa: number): Promise<boolean> {
  const r = await query(
    `UPDATE ParticipanteConversa
        SET limpaAte = (SELECT COALESCE(MAX(idMensagem), 0) FROM Mensagem WHERE idConversa = $1),
            lidaAte  = GREATEST(lidaAte, (SELECT COALESCE(MAX(idMensagem), 0) FROM Mensagem WHERE idConversa = $1))
      WHERE idConversa = $1 AND idUsuario = $2 RETURNING idConversa`,
    [idConversa, eu],
  );
  return r.length > 0;
}

// Total de mensagens não lidas (limitado a 100 para a consulta continuar barata).
export async function contarMensagensNaoLidas(eu: number): Promise<number> {
  const [l] = await query<{ total: number }>(
    `SELECT COUNT(*)::int AS total FROM (
       SELECT 1 FROM Mensagem m
         JOIN ParticipanteConversa pc ON pc.idConversa = m.idConversa AND pc.idUsuario = $1
        WHERE m.idAutor <> $1 AND m.idMensagem > GREATEST(pc.lidaAte, pc.limpaAte)
        LIMIT 100
     ) t`,
    [eu],
  );
  return l.total;
}
