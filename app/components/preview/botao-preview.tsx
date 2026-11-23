"use client";

import { useEffect, useRef, useState } from "react";

type Estado = "parado" | "carregando" | "tocando" | "indisponivel" | "erro";

// Só uma prévia toca por vez: ao iniciar outra, a anterior é pausada.
let tocandoAgora: { audio: HTMLAudioElement; parar: () => void } | null = null;
// Endereço do trecho por música (os links do Deezer expiram, então o erro limpa a entrada).
const enderecos = new Map<string, string | null>();

function configurar(
  audio: HTMLAudioElement,
  url: string,
  aoTerminar: () => void,
  aoProgredir: () => void,
  aoFalhar: () => void,
) {
  audio.src = url;
  audio.onended = aoTerminar;
  audio.ontimeupdate = aoProgredir;
  audio.onerror = aoFalhar;
}

// Botão de prévia (30 segundos). O trecho é procurado só quando a pessoa clica, para não
// consultar o servidor de cada música da lista. Sem trecho disponível, o botão avisa e fica desativado.
export default function BotaoPreview({
  titulo,
  artista,
  className = "",
}: {
  titulo: string;
  artista: string;
  className?: string;
}) {
  const [estado, setEstado] = useState<Estado>("parado");
  const [progresso, setProgresso] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chave = `${titulo}|${artista}`;

  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.pause();
      if (tocandoAgora?.audio === audio) tocandoAgora = null;
    };
  }, []);

  function parar() {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    if (tocandoAgora?.audio === audio) tocandoAgora = null;
    setEstado("parado");
    setProgresso(0);
  }

  async function alternar() {
    if (estado === "tocando") return parar();
    if (estado === "carregando" || estado === "indisponivel") return;

    tocandoAgora?.parar();

    let url = enderecos.get(chave);
    if (url === undefined) {
      setEstado("carregando");
      try {
        const resposta = await fetch(`/api/preview?${new URLSearchParams({ titulo, artista })}`);
        const dados = (await resposta.json()) as { url?: string | null };
        url = dados.url ?? null;
        enderecos.set(chave, url);
      } catch {
        setEstado("erro");
        return;
      }
    }
    if (!url) {
      setEstado("indisponivel");
      return;
    }

    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;
    configurar(
      audio,
      url,
      parar,
      () => setProgresso(audio.duration ? audio.currentTime / audio.duration : 0),
      () => {
        enderecos.delete(chave);
        setEstado("erro");
      },
    );

    try {
      await audio.play();
      tocandoAgora = { audio, parar };
      setEstado("tocando");
    } catch {
      setEstado("erro");
    }
  }

  const rotulo =
    estado === "tocando" ? `Pausar prévia de ${titulo}`
    : estado === "indisponivel" ? "Prévia indisponível para esta música"
    : estado === "erro" ? "Não foi possível tocar. Toque para tentar de novo"
    : estado === "carregando" ? "Carregando prévia"
    : `Ouvir prévia de ${titulo}`;

  const raio = 15;
  const circunferencia = 2 * Math.PI * raio;

  return (
    <button
      type="button"
      onClick={alternar}
      disabled={estado === "indisponivel"}
      aria-label={rotulo}
      title={rotulo}
      className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-violet-400/50 hover:bg-violet-500/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 disabled:cursor-not-allowed disabled:opacity-35 ${
        estado === "tocando" ? "border-violet-400/60 bg-violet-500/20 text-white" : ""
      } ${estado === "erro" ? "border-red-400/40 text-red-300" : ""} ${className}`}
    >
      {estado === "tocando" && (
        <svg viewBox="0 0 36 36" aria-hidden="true" className="pointer-events-none absolute inset-0 -rotate-90">
          <circle
            cx="18"
            cy="18"
            r={raio}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-violet-300"
            strokeDasharray={circunferencia}
            strokeDashoffset={circunferencia * (1 - progresso)}
          />
        </svg>
      )}

      {estado === "carregando" ? (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="9" className="opacity-25" />
          <path d="M21 12a9 9 0 0 0-9-9" strokeLinecap="round" />
        </svg>
      ) : estado === "tocando" ? (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="ml-0.5 h-4 w-4" fill="currentColor">
          <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
        </svg>
      )}
    </button>
  );
}
