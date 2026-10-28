import { query, transacao } from "./db";

export type NovoUsuario = {
  username: string;
  email: string;
  senhaHash: string;
};

export class UsuarioDuplicadoError extends Error {
  constructor(public campo: "email" | "username") {
    super(`${campo} já cadastrado`);
  }
}

export async function existeEmail(email: string): Promise<boolean> {
  const linhas = await query("SELECT 1 FROM Usuario WHERE LOWER(email) = LOWER($1)", [email]);
  return linhas.length > 0;
}

export async function existeUsername(username: string): Promise<boolean> {
  const linhas = await query("SELECT 1 FROM Usuario WHERE LOWER(username) = LOWER($1)", [username]);
  return linhas.length > 0;
}

// Cria o usuário e o perfil vazio (relação 1:1) na mesma transação.
export async function criarUsuario({ username, email, senhaHash }: NovoUsuario): Promise<number> {
  try {
    return await transacao(async (client) => {
      const usuario = await client.query<{ idusuario: number }>(
        "INSERT INTO Usuario (username, email, senhaHash) VALUES ($1, $2, $3) RETURNING idUsuario",
        [username, email, senhaHash],
      );
      const idUsuario = usuario.rows[0].idusuario;
      await client.query("INSERT INTO Perfil (idUsuario) VALUES ($1)", [idUsuario]);
      return idUsuario;
    });
  } catch (erro) {
    // 23505 = violação de unicidade. Cobre a corrida em que dois cadastros
    // iguais chegam ao mesmo tempo.
    const e = erro as { code?: string; constraint?: string };
    if (e.code === "23505") {
      throw new UsuarioDuplicadoError(e.constraint === "usuario_email_unico" ? "email" : "username");
    }
    throw erro;
  }
}

export type UsuarioParaLogin = {
  idUsuario: number;
  username: string;
  senhaHash: string;
  status: "ativa" | "inativa" | "excluida";
};

// Aceita username ou e-mail (a comparação ignora maiúsculas).
export async function buscarParaLogin(identificador: string): Promise<UsuarioParaLogin | null> {
  const linhas = await query<{
    idusuario: number;
    username: string;
    senhahash: string;
    status: "ativa" | "inativa" | "excluida";
  }>(
    `SELECT idUsuario, username, senhaHash, status FROM Usuario
      WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1) LIMIT 1`,
    [identificador],
  );
  const l = linhas[0];
  return l ? { idUsuario: l.idusuario, username: l.username, senhaHash: l.senhahash, status: l.status } : null;
}
