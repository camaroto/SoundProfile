"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { buscarParaLogin } from "@/lib/usuarios";
import { criarSessao, encerrarSessao } from "@/lib/sessao";

export type EstadoLogin = {
  erro?: string;
  username: string; // a senha nunca volta para a tela
};

// Hash de uma senha qualquer. Serve para gastar o mesmo tempo de verificação
// quando o usuário não existe, para não revelar quais contas existem.
const HASH_FALSO = "$2b$12$xvC9u4CjCZr49LItXwIPZuwNSOVVDzOnVpAsDHh12krUEa9fKVkli";

export async function entrar(_anterior: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { erro: "Informe seu usuário (ou e-mail) e a senha.", username };
  }

  const usuario = await buscarParaLogin(username);
  const senhaConfere = await bcrypt.compare(password, usuario?.senhaHash ?? HASH_FALSO);

  // UC04 2a: mesma mensagem para usuário inexistente e senha errada.
  if (!usuario || !senhaConfere) {
    return { erro: "Usuário ou senha inválidos.", username };
  }

  // UC04 2b
  if (usuario.status !== "ativa") {
    return { erro: "Esta conta não está ativa.", username };
  }

  await criarSessao(usuario.idUsuario);
  redirect("/");
}

export async function sair(): Promise<void> {
  await encerrarSessao();
  redirect("/");
}
