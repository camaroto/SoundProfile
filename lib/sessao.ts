
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "./api";

const COOKIE = "sp_sessao";

export type UsuarioLogado = {
  idUsuario: number;
  username: string;
  role: "usuario" | "admin";
  avatar: string | null;
};

export type SessaoResposta = {
  token: string;
  expiraEm: string;
  usuario: UsuarioLogado;
};

export async function guardarSessao(sessao: SessaoResposta): Promise<void> {
  const expiraEm = new Date(sessao.expiraEm);

  if (!sessao.token || Number.isNaN(expiraEm.getTime()) || expiraEm <= new Date()) {
    throw new Error("A API retornou uma sessão inválida.");
  }

  (await cookies()).set(COOKIE, sessao.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiraEm,
  });
}

export async function obterTokenSessao(): Promise<string | null> {
  return (await cookies()).get(COOKIE)?.value ?? null;
}

export const obterUsuarioLogado = cache(async (): Promise<UsuarioLogado | null> => {
  const token = await obterTokenSessao();

  if (!token) return null;

  try {
    return await api<UsuarioLogado>("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (erro) {
    if (
      erro instanceof Error &&
      "status" in erro &&
      ((erro as { status: number }).status === 401 ||
        (erro as { status: number }).status === 403)
    ) {
      (await cookies()).delete(COOKIE);
    }

    console.error("Falha ao validar a sessão:", erro);
    return null;
  }
});

export async function exigirLogin(): Promise<UsuarioLogado> {
  const usuario = await obterUsuarioLogado();

  if (!usuario) redirect("/login");

  return usuario;
}

export async function encerrarSessao(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;

  try {
    if (token) {
      await api<void>("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch (erro) {
    console.error("Falha ao encerrar a sessão na API:", erro);
  } finally {
    jar.delete(COOKIE);
  }
}

export async function exigirAdmin(): Promise<UsuarioLogado> {
  const usuario = await obterUsuarioLogado();

  if (!usuario) redirect("/login");
  if (usuario.role !== "admin") redirect("/");

  return usuario;
}
