"use server";

import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { guardarSessao, type SessaoResposta } from "@/lib/sessao";

export type EstadoVerificacao = {
  email: string;
  erro?: string;
  mensagem?: string;
};

export async function verificarCodigo(
  _estadoAnterior: EstadoVerificacao,
  formData: FormData,
): Promise<EstadoVerificacao> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const codigo = String(formData.get("codigo") ?? "").trim();

  if (!email) {
    return { email, erro: "E-mail não informado." };
  }

  if (!/^\d{6}$/.test(codigo)) {
    return {
      email,
      erro: "Digite o código de verificação com seis números.",
    };
  }

  let sessao: SessaoResposta;

  try {
    sessao = await api<SessaoResposta>("/api/auth/verificar-email", {
      method: "POST",
      body: JSON.stringify({ email, codigo }),
    });
  } catch (erro) {
    if (erro instanceof ApiError) {
      return { email, erro: erro.message };
    }

    console.error("Falha ao verificar e-mail:", erro);

    return {
      email,
      erro: "Não foi possível verificar o e-mail. Tente novamente.",
    };
  }

  try {
    await guardarSessao(sessao);
  } catch (erro) {
    console.error("Falha ao guardar sessão:", erro);

    return {
      email,
      erro: "E-mail verificado, mas não foi possível iniciar a sessão.",
    };
  }

  redirect("/");
}

export async function reenviarCodigo(
  _estadoAnterior: EstadoVerificacao,
  formData: FormData,
): Promise<EstadoVerificacao> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    return { email, erro: "E-mail não informado." };
  }

  try {
    const resposta = await api<{ mensagem: string }>(
      "/api/auth/reenviar-codigo",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      },
    );

    return {
      email,
      mensagem: resposta.mensagem || "Código enviado novamente.",
    };
  } catch (erro) {
    if (erro instanceof ApiError) {
      return { email, erro: erro.message };
    }

    console.error("Falha ao reenviar código:", erro);

    return {
      email,
      erro: "Não foi possível reenviar o código. Tente novamente.",
    };
  }
}