"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { DiscoRatingInput } from "@/app/components/disco-rating";
import { removerAvaliacaoAction, salvarAvaliacaoAction, type EstadoAvaliacao } from "@/app/avaliacoes/actions";
import type { TipoItem } from "@/lib/constantes";

const botaoPrimario =
  "rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-violet-600";
const botaoSecundario =
  "rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/80 transition hover:border-violet-500/50 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400";

export default function PainelAvaliacao({
  tipo,
  idItem,
  logado,
  minha,
  nomeItem,
}: {
  tipo: TipoItem;
  idItem: number;
  logado: boolean;
  minha: { idAvaliacao: number; nota: number; comentario: string } | null;
  nomeItem: string;
}) {
  const [estado, formAction, pendente] = useActionState<EstadoAvaliacao, FormData>(salvarAvaliacaoAction, {});
  const [nota, setNota] = useState(minha?.nota ?? 0);
  const [texto, setTexto] = useState(minha?.comentario ?? "");

  if (!logado) {
    return (
      <div>
        <h2 className="text-lg font-semibold">Sua avaliação</h2>
        <p className="mt-3 text-sm leading-6 text-white/55">Entre na sua conta para avaliar {nomeItem}.</p>
        <div className="mt-4 flex gap-2">
          <Link href="/login" className={botaoPrimario}>Entrar</Link>
          <Link href="/cadastro" className={botaoSecundario}>Criar conta</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold">{minha ? "Sua avaliação" : "Avaliar"}</h2>

      <form action={formAction} className="mt-4 space-y-4">
        <input type="hidden" name="tipo" value={tipo} />
        <input type="hidden" name="idItem" value={idItem} />
        <input type="hidden" name="nota" value={nota || ""} />

        <DiscoRatingInput valor={nota} onChange={setNota} tamanho={34} />

        <div>
          <label htmlFor={`comentario-${tipo}`} className="mb-2 block text-sm font-medium">
            Comentário (opcional)
          </label>
          <textarea
            id={`comentario-${tipo}`}
            name="comentario"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            maxLength={1000}
            rows={4}
            placeholder="O que você achou?"
            className="w-full resize-none rounded-lg border border-white/10 bg-neutral-800 p-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
          />
          <p className="mt-1 text-right text-xs text-white/30">{texto.length}/1000</p>
        </div>

        {estado.erro && (
          <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {estado.erro}
          </p>
        )}

        <button type="submit" disabled={pendente || nota === 0} className={`${botaoPrimario} w-full`}>
          {pendente ? "Salvando..." : minha ? "Salvar alterações" : "Publicar avaliação"}
        </button>
        <p role="status" aria-live="polite" className="text-center text-xs text-emerald-300">
          {estado.ok ? "Avaliação salva." : ""}
        </p>
      </form>

      {minha && (
        <form action={removerAvaliacaoAction} className="mt-2">
          <input type="hidden" name="tipo" value={tipo} />
          <input type="hidden" name="idItem" value={idItem} />
          <input type="hidden" name="idAvaliacao" value={minha.idAvaliacao} />
          <button type="submit" className="w-full rounded-lg px-4 py-2 text-sm text-white/45 transition hover:bg-red-500/10 hover:text-red-300">
            Remover minha avaliação
          </button>
        </form>
      )}
    </div>
  );
}
