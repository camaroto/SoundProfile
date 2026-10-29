"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { criarUsuario, existeEmail, existeUsername, UsuarioDuplicadoError } from "@/lib/usuarios";
import { validarCadastro, type ErrosCadastro } from "@/lib/validacao";

export type EstadoCadastro = {
  erros: ErrosCadastro;
  valores: { username: string; email: string }; // a senha nunca volta para a tela
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
  if (Object.keys(erros).length > 0) return { erros, valores };

  // RN02: um e-mail por conta (e username único, pois vira a URL do perfil).
  if (await existeEmail(email)) erros.email = "Este e-mail já está em uso.";
  if (await existeUsername(username)) erros.username = "Este nome de usuário já está em uso.";
  if (Object.keys(erros).length > 0) return { erros, valores };

  try {
    const senhaHash = await bcrypt.hash(password, 12);
    await criarUsuario({ username, email, senhaHash });
  } catch (erro) {
    if (erro instanceof UsuarioDuplicadoError) {
      const mensagem =
        erro.campo === "email" ? "Este e-mail já está em uso." : "Este nome de usuário já está em uso.";
      return { erros: { [erro.campo]: mensagem }, valores };
    }
    console.error("Falha ao cadastrar usuário:", erro);
    return { erros: {}, valores, erroGeral: "Não foi possível criar a conta. Tente novamente." };
  }

  redirect("/login?cadastro=ok");
}
