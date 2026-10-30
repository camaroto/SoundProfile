"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconeChat } from "./icones";
import SinoNotificacoes from "./sino";

// Ícones do menu: Social (mensagens não lidas) e sino (notificações não lidas).
// Os dois números vêm de uma única consulta, repetida a cada 20 s com a aba visível.
export default function IndicadorSocial() {
  const [mensagens, setMensagens] = useState(0);
  const [notificacoes, setNotificacoes] = useState(0);

  useEffect(() => {
    let ativo = true;

    async function atualizar() {
      if (document.visibilityState !== "visible") return;
      try {
        const r = await fetch("/api/social/resumo", { cache: "no-store" });
        if (!r.ok) return;
        const d = (await r.json()) as { mensagens: number; notificacoes: number };
        if (!ativo) return;
        setMensagens(d.mensagens);
        setNotificacoes(d.notificacoes);
      } catch {
        // Sem conexão: mantém o último valor e tenta de novo no próximo ciclo.
      }
    }

    void atualizar();
    const timer = setInterval(atualizar, 20_000);
    const aoVoltar = () => void atualizar();
    document.addEventListener("visibilitychange", aoVoltar);
    return () => {
      ativo = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", aoVoltar);
    };
  }, []);

  return (
    <>
      <Link
        href="/social"
        aria-label={mensagens > 0 ? `Social, ${mensagens >= 99 ? "mais de 99" : mensagens} mensagens não lidas` : "Social"}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-neutral-300 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
      >
        <IconeChat className="h-5 w-5" />
        {mensagens > 0 && (
          <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full bg-violet-500 px-1 text-center text-[10px] font-bold leading-[18px] text-white ring-2 ring-neutral-950">
            {mensagens > 99 ? "99+" : mensagens}
          </span>
        )}
      </Link>
      <SinoNotificacoes naoLidas={notificacoes} aoLer={() => setNotificacoes(0)} />
    </>
  );
}
