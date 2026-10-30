"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Avatar from "./avatar";
import { IconeSino } from "./icones";
import { marcarNotificacoesLidasAction } from "@/app/social/actions";
import { formatarDataHora } from "@/lib/formatar-tempo";

type Item = { id: number; lida: boolean; criadaEm: string; username: string; nome: string; avatar: string | null };

// Sino do menu: mostra o total de não lidas e abre a lista das últimas notificações.
// Abrir a lista marca tudo como lido (os itens novos continuam destacados enquanto ela está aberta).
export default function SinoNotificacoes({ naoLidas, aoLer }: { naoLidas: number; aoLer: () => void }) {
  const [aberto, setAberto] = useState(false);
  const [itens, setItens] = useState<Item[] | null>(null);
  const [erro, setErro] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora ou apertar Esc.
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (raiz.current && !raiz.current.contains(e.target as Node)) setAberto(false);
    };
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", tecla);
    };
  }, [aberto]);

  async function alternar() {
    if (aberto) return setAberto(false);
    setAberto(true);
    setErro(false);
    try {
      const r = await fetch("/api/social/notificacoes", { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      const d = (await r.json()) as { itens: Item[]; naoLidas: number };
      setItens(d.itens);
      if (d.naoLidas > 0) {
        await marcarNotificacoesLidasAction();
        aoLer();
      }
    } catch {
      setErro(true);
    }
  }

  return (
    <div ref={raiz} className="relative">
      <button
        type="button"
        onClick={alternar}
        aria-haspopup="true"
        aria-expanded={aberto}
        aria-label={naoLidas > 0 ? `Notificações, ${naoLidas >= 99 ? "mais de 99" : naoLidas} não lidas` : "Notificações"}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-neutral-300 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
      >
        <IconeSino className="h-5 w-5" />
        {naoLidas > 0 && (
          <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full bg-violet-500 px-1 text-center text-[10px] font-bold leading-[18px] text-white ring-2 ring-neutral-950">
            {naoLidas > 99 ? "99+" : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div role="dialog" aria-label="Notificações" className="fixed inset-x-3 top-16 z-50 max-h-[70vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#14121c] shadow-2xl shadow-black/60 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <h2 className="text-sm font-semibold">Notificações</h2>
            <Link href="/social/notificacoes" onClick={() => setAberto(false)} className="text-xs font-medium text-violet-300 hover:underline">Ver todas</Link>
          </div>

          {erro ? (
            <p role="alert" className="px-4 py-8 text-center text-sm text-red-400">Não foi possível carregar. Tente de novo.</p>
          ) : itens === null ? (
            <p role="status" className="px-4 py-8 text-center text-sm text-white/40">Carregando…</p>
          ) : itens.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium">Nenhuma notificação</p>
              <p className="mt-1 text-xs text-white/40">Quando alguém começar a seguir você, o aviso aparece aqui.</p>
            </div>
          ) : (
            <ul>
              {itens.map((i) => (
                <li key={i.id} className="border-b border-white/[0.06] last:border-0">
                  <Link
                    href={`/perfil/${i.username}`}
                    onClick={() => setAberto(false)}
                    className={`flex items-center gap-3 px-4 py-3 transition hover:bg-white/[0.05] ${i.lida ? "" : "bg-violet-500/[0.08]"}`}
                  >
                    <Avatar src={i.avatar} nome={i.nome} className="h-10 w-10" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm leading-5"><strong className="font-semibold">{i.nome}</strong> começou a seguir você.</span>
                      <time dateTime={i.criadaEm} suppressHydrationWarning className="text-xs text-white/40">{formatarDataHora(new Date(i.criadaEm))}</time>
                    </span>
                    {!i.lida && <span aria-label="Nova" className="h-2 w-2 shrink-0 rounded-full bg-violet-400" />}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
