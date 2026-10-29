"use client";

import { useActionState } from "react";
import Link from "next/link";
import CampoTexto from "@/app/components/campo-texto";
import { cadastrarUsuario, type EstadoCadastro } from "./actions";

const estadoInicial: EstadoCadastro = {
  erros: {},
  valores: { username: "", email: "" },
};

export default function FormularioCadastro() {
  const [estado, formAction, pendente] = useActionState(cadastrarUsuario, estadoInicial);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {estado.erroGeral && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
        >
          {estado.erroGeral}
        </p>
      )}

      <CampoTexto
        id="username"
        rotulo="Nome de usuário"
        icone="/headphone-svgrepo-com.svg"
        type="text"
        placeholder="Escolha seu username"
        autoComplete="username"
        maxLength={20}
        required
        defaultValue={estado.valores.username}
        erro={estado.erros.username}
      />

      <CampoTexto
        id="email"
        rotulo="E-mail"
        icone="/email-svgrepo-com.svg"
        type="email"
        placeholder="Digite seu e-mail"
        autoComplete="email"
        required
        defaultValue={estado.valores.email}
        erro={estado.erros.email}
      />

      <CampoTexto
        id="password"
        name="password"
        rotulo="Senha"
        icone="/locked-svgrepo-com.svg"
        type="password"
        placeholder="Crie uma senha"
        autoComplete="new-password"
        minLength={8}
        required
        erro={estado.erros.password}
        ajuda="A senha deve ter pelo menos 8 caracteres."
      />

      <p className="text-center text-sm text-neutral-400">
        Já tem uma conta?{" "}
        <Link
          href="/login"
          className="font-semibold text-violet-400 transition hover:text-violet-300"
        >
          Entre aqui
        </Link>
      </p>

      <button
        type="submit"
        disabled={pendente}
        className="mt-2 w-full rounded-lg bg-purple-600 p-3 font-bold text-white transition hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pendente ? "Criando conta..." : "Criar conta"}
      </button>
    </form>
  );
}
