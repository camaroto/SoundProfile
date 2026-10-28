"use client";

import { useActionState } from "react";
import Link from "next/link";
import CampoTexto from "@/app/components/campo-texto";
import { entrar, type EstadoLogin } from "./actions";

const estadoInicial: EstadoLogin = { username: "" };

export default function FormularioLogin() {
  const [estado, formAction, pendente] = useActionState(entrar, estadoInicial);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {estado.erro && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
        >
          {estado.erro}
        </p>
      )}

      <CampoTexto
        id="username"
        rotulo="Nome de usuário ou e-mail"
        icone="/headphone-svgrepo-com.svg"
        type="text"
        placeholder="Digite seu username"
        autoComplete="username"
        required
        defaultValue={estado.username}
      />

      <CampoTexto
        id="password"
        rotulo="Senha"
        icone="/locked-svgrepo-com.svg"
        type="password"
        placeholder="Digite sua senha"
        autoComplete="current-password"
        required
      />

      <p className="text-center text-sm text-neutral-400">
        Ainda não tem uma conta?{" "}
        <Link
          href="/cadastro"
          className="font-semibold text-violet-400 transition hover:text-violet-300"
        >
          Cadastre-se
        </Link>
      </p>

      <button
        type="submit"
        disabled={pendente}
        className="mt-2 w-full rounded-lg bg-purple-600 p-3 font-bold text-white transition hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pendente ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
