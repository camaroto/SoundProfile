
"use server";

import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { guardarSessao, encerrarSessao, type SessaoResposta } from "@/lib/sessao";

export type EstadoLogin = {
  erro?: string;
  username: string;
};

export async function entrar(
  _anterior: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return {
      erro: "Informe seu usuário (ou e-mail) e a senha.",
      username,
    };
  }

  let sessao: SessaoResposta;

  try {
    sessao = await api<SessaoResposta>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        login: username,
        password,
      }),
    });
  } catch (erro) {
    if (erro instanceof ApiError) {
      if (erro.codigo === "EMAIL_NAO_VERIFICADO") {
        const email = erro.campos.email || username;
        redirect(`/verificar-email?email=${encodeURIComponent(email)}`);
      }

      if (erro.status === 401) {
        return {
          erro: "Usuário ou senha inválidos.",
          username,
        };
      }

      return {
        erro: erro.message,
        username,
      };
    }

    console.error("Falha ao entrar:", erro);

    return {
      erro: "Não foi possível entrar. Tente novamente.",
      username,
    };
  }

  await guardarSessao(sessao);

  redirect("/");
}

export async function sair(): Promise<void> {
  await encerrarSessao();
  redirect("/");
}
