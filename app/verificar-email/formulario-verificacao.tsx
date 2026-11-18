"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  verificarCodigo,
  reenviarCodigo,
  type EstadoVerificacao,
} from "./actions";

export default function FormularioVerificacao({
  email,
}: {
  email: string;
}) {
  const estadoInicial: EstadoVerificacao = { email };

  const [estado, formAction, pendente] = useActionState(
    verificarCodigo,
    estadoInicial,
  );

  const [
    estadoReenvio,
    reenvioAction,
    reenvioPendente,
  ] = useActionState(reenviarCodigo, estadoInicial);

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <p className="text-sm text-neutral-400">
          Enviamos um código de seis dígitos para:
        </p>
        <p className="mt-1 break-all font-semibold text-violet-300">
          {email}
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        <input type="hidden" name="email" value={email} />

        {estado.erro && (
          <p
            role="alert"
            className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
          >
            {estado.erro}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <label
            htmlFor="codigo"
            className="text-sm font-medium text-neutral-200"
          >
            Código de verificação
          </label>

          <input
            id="codigo"
            name="codigo"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            minLength={6}
            placeholder="000000"
            required
            className="w-full rounded-lg border border-white/10 bg-neutral-800 p-3 text-center text-2xl font-bold tracking-[0.5em] text-white outline-none transition placeholder:text-neutral-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
          />

          <p className="text-xs text-neutral-500">
            Digite o código de seis números enviado para seu e-mail.
          </p>
        </div>

        <button
          type="submit"
          disabled={pendente}
          className="w-full rounded-lg bg-purple-600 p-3 font-bold text-white transition hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendente ? "Verificando..." : "Verificar e-mail"}
        </button>
      </form>

      <div className="border-t border-white/10 pt-5">
        <p className="mb-3 text-center text-sm text-neutral-400">
          Não recebeu o código?
        </p>

        {estadoReenvio.mensagem && (
          <p
            role="status"
            className="mb-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-sm text-emerald-300"
          >
            {estadoReenvio.mensagem}
          </p>
        )}

        {estadoReenvio.erro && (
          <p
            role="alert"
            className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-center text-sm text-red-300"
          >
            {estadoReenvio.erro}
          </p>
        )}

        <form action={reenvioAction}>
          <input type="hidden" name="email" value={email} />

          <button
            type="submit"
            disabled={reenvioPendente}
            className="w-full rounded-lg border border-purple-500/40 p-3 font-semibold text-violet-300 transition hover:bg-purple-500/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {reenvioPendente ? "Enviando..." : "Reenviar código"}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-neutral-400">
        E-mail incorreto?{" "}
        <Link
          href="/cadastro"
          className="font-semibold text-violet-400 transition hover:text-violet-300"
        >
          Voltar ao cadastro
        </Link>
      </p>
    </div>
  );
}