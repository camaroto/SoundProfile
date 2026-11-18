
"use server";

import { redirect } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { validarCadastro, type ErrosCadastro } from "@/lib/validacao";

export type EstadoCadastro = {
  erros: ErrosCadastro;
  valores: { username: string; email: string };
  erroGeral?: string;
};

function texto(formData: FormData, campo: string) {
  return String(formData.get(campo) ?? "").trim();
}

export async function cadastrarUsuario(
  _estadoAnterior: EstadoCadastro,
  formData: FormData,
): Promise<EstadoCadastro> {
  const username = texto(formData, "username");
  const email = texto(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");

  const valores = { username, email };

  const erros = validarCadastro({ username, email, password });

  if (Object.keys(erros).length > 0) {
    return { erros, valores };
  }

  try {
    await api("/api/auth/cadastro", {
      method: "POST",
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });
  } catch (erro) {
    if (erro instanceof ApiError) {
      const errosApi = erro.campos as ErrosCadastro;

      if (Object.keys(errosApi).length > 0) {
        return {
          erros: errosApi,
          valores,
        };
      }

      if (erro.status === 409) {
        return {
          erros: {},
          valores,
          erroGeral: erro.message,
        };
      }

      return {
        erros: {},
        valores,
        erroGeral: erro.message,
      };
    }

    console.error("Falha ao cadastrar usuário:", erro);

    return {
      erros: {},
      valores,
      erroGeral: "Não foi possível criar a conta. Tente novamente.",
    };
  }

  redirect(`/verificar-email?email=${encodeURIComponent(email)}`);
}
