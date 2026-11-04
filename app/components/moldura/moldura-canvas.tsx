"use client";

import { useEffect, useRef } from "react";
import type { IdMoldura } from "@/lib/molduras";

type Animacao = { destroy(): void };

// Desenha a moldura animada por cima do banner e da foto. A animação só é carregada
// quando a moldura é usada e só roda em telas a partir de 768 px (o encaixe da moldura
// precisa de espaço); ela pausa sozinha quando sai da tela ou com "reduzir movimento".
export default function MolduraCanvas({ moldura }: { moldura: IdMoldura }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const larga = window.matchMedia("(min-width: 768px)");
    let animacao: Animacao | null = null;
    let cancelado = false;

    async function iniciar() {
      if (animacao || !canvas) return;
      if (moldura === "kraken") {
        const { KrakenFrame } = await import("./animacoes/kraken-frame");
        if (cancelado || animacao) return;
        animacao = new KrakenFrame(canvas, {
          frame: "/molduras/kraken/frame.webp",
          red: "/molduras/kraken/red.webp",
          disc: "/molduras/kraken/disc.png",
          level: 1,
        }) as Animacao;
      } else {
        const { SakuraFrame } = await import("./animacoes/sakura-frame");
        if (cancelado || animacao) return;
        animacao = new SakuraFrame(canvas, { level: 1 }) as Animacao;
      }
    }

    function parar() {
      animacao?.destroy();
      animacao = null;
    }

    function aoMudarLargura() {
      if (larga.matches) void iniciar();
      else parar();
    }

    aoMudarLargura();
    larga.addEventListener("change", aoMudarLargura);
    return () => {
      cancelado = true;
      larga.removeEventListener("change", aoMudarLargura);
      parar();
    };
  }, [moldura]);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 h-full w-full" />;
}
