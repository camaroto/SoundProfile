import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "node:crypto";
import { query } from "./db";

const COOKIE = "sp_sessao";
const DURACAO_DIAS = 30;

export type UsuarioLogado = {
  idUsuario: number;
  username: string;
  role: "usuario" | "admin";
  avatar: string | null;
};

const hashDoToken = (token: string) => createHash("sha256").update(token).digest("hex");

// Cria a sessão no banco e entrega ao navegador um cookie com o token.
// O cookie é httpOnly: o JavaScript da página não consegue lê-lo.
export async function criarSessao(idUsuario: number): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiraEm = new Date(Date.now() + DURACAO_DIAS * 24 * 60 * 60 * 1000);

  await query("DELETE FROM Sessao WHERE expiraEm < now()");
  await query("INSERT INTO Sessao (idUsuario, tokenHash, expiraEm) VALUES ($1, $2, $3)", [
    idUsuario,
    hashDoToken(token),
    expiraEm,
  ]);

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false",
    path: "/",
    expires: expiraEm,
  });
}

// Quem está logado nesta requisição (ou null). Sem cookie, nem consulta o banco.
export const obterUsuarioLogado = cache(async (): Promise<UsuarioLogado | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;

  try {
    const linhas = await query<{
      idusuario: number;
      username: string;
      role: "usuario" | "admin";
      avatar: string | null;
    }>(
      `SELECT u.idUsuario, u.username, u.role, p.avatar
         FROM Sessao s
         JOIN Usuario u ON u.idUsuario = s.idUsuario
         LEFT JOIN Perfil p ON p.idUsuario = u.idUsuario
        WHERE s.tokenHash = $1 AND s.expiraEm > now() AND u.status = 'ativa'`,
      [hashDoToken(token)],
    );
    const l = linhas[0];
    return l ? { idUsuario: l.idusuario, username: l.username, role: l.role, avatar: l.avatar } : null;
  } catch (erro) {
    // Banco fora do ar não deve derrubar o site inteiro: trata como deslogado.
    console.error("Falha ao ler a sessão:", erro);
    return null;
  }
});

// RN01: para páginas que exigem login.
export async function exigirLogin(): Promise<UsuarioLogado> {
  const usuario = await obterUsuarioLogado();
  if (!usuario) redirect("/login");
  return usuario;
}

export async function encerrarSessao(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await query("DELETE FROM Sessao WHERE tokenHash = $1", [hashDoToken(token)]);
  jar.delete(COOKIE);
}

// Área do administrador. Sempre revalidada no servidor, nunca só escondendo botões.
export async function exigirAdmin(): Promise<UsuarioLogado> {
  const usuario = await obterUsuarioLogado();
  if (!usuario) redirect("/login");
  if (usuario.role !== "admin") redirect("/");
  return usuario;
}
