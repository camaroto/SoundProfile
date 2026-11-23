"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { salvarPerfil, type EstadoPerfil } from "./actions";

const campo =
  "w-full rounded-lg border bg-neutral-800 p-3 text-white outline-none transition placeholder:text-neutral-500 focus:ring-2";
const borda = (erro?: string) =>
  erro
    ? "border-red-500/70 focus:border-red-500 focus:ring-red-500/30"
    : "border-white/10 focus:border-purple-500 focus:ring-purple-500/30";

function Erro({ id, texto }: { id: string; texto?: string }) {
  return texto ? (
    <p id={id} role="alert" className="mt-2 text-xs text-red-400">
      {texto}
    </p>
  ) : null;
}

export default function FormularioPerfil({
  username,
  inicial,
}: {
  username: string;
  inicial: EstadoPerfil["valores"];
}) {
  const [estado, formAction, pendente] = useActionState(salvarPerfil, {
    erros: {},
    valores: inicial,
  } as EstadoPerfil);
  const [tamanhoBio, setTamanhoBio] = useState(inicial.biografia.length);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-7">
      {estado.erroGeral && (
        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {estado.erroGeral}
        </p>
      )}

      <div>
        <label htmlFor="nomeExibicao" className="mb-2 block text-sm font-medium text-white">
          Nome de exibição
        </label>
        <input
          id="nomeExibicao"
          name="nomeExibicao"
          defaultValue={estado.valores.nomeExibicao}
          maxLength={40}
          placeholder={username}
          aria-invalid={estado.erros.nomeExibicao ? true : undefined}
          aria-describedby="nomeExibicao-erro"
          className={`${campo} ${borda(estado.erros.nomeExibicao)}`}
        />
        <Erro id="nomeExibicao-erro" texto={estado.erros.nomeExibicao} />
      </div>

      <div>
        <label htmlFor="localizacao" className="mb-2 block text-sm font-medium text-white">
          Localização
        </label>
        <input
          id="localizacao"
          name="localizacao"
          defaultValue={estado.valores.localizacao}
          maxLength={60}
          placeholder="Cidade, estado"
          aria-invalid={estado.erros.localizacao ? true : undefined}
          aria-describedby="localizacao-erro"
          className={`${campo} ${borda(estado.erros.localizacao)}`}
        />
        <Erro id="localizacao-erro" texto={estado.erros.localizacao} />
      </div>

      <div>
        <label htmlFor="biografia" className="mb-2 block text-sm font-medium text-white">
          Biografia
        </label>
        <textarea
          id="biografia"
          name="biografia"
          defaultValue={estado.valores.biografia}
          onChange={(e) => setTamanhoBio(e.target.value.length)}
          maxLength={300}
          rows={4}
          placeholder="Conte um pouco sobre o seu gosto musical"
          aria-invalid={estado.erros.biografia ? true : undefined}
          aria-describedby="biografia-erro"
          className={`${campo} resize-none ${borda(estado.erros.biografia)}`}
        />
        <div className="flex justify-between">
          <Erro id="biografia-erro" texto={estado.erros.biografia} />
          <span className="ml-auto mt-1 text-xs text-white/30">{tamanhoBio}/300</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pendente}
          className="rounded-lg bg-purple-600 px-6 py-3 font-bold text-white transition hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendente ? "Salvando..." : "Salvar alterações"}
        </button>
        <Link
          href={`/perfil/${username}`}
          className="rounded-lg border border-white/10 px-6 py-3 font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
