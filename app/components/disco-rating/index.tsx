"use client";

import { useState } from "react";
import { formatarNota } from "./formatar";

// Escala 0 a 5, em passos de 0,5. Usa o mesmo disco dourado do perfil.

function Disco({ preenchimento, tamanho }: { preenchimento: number; tamanho: number }) {
  const largura = `${Math.min(1, Math.max(0, preenchimento)) * 100}%`;

  return (
    <span
      className="relative inline-block shrink-0"
      style={{ width: tamanho, height: tamanho }}
      aria-hidden="true"
    >
      <img
        src="/disco-ouro.png"
        alt=""
        className="absolute inset-0 h-full w-full object-contain opacity-20 grayscale"
      />
      <span
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: largura }}
      >
        <img
          src="/disco-ouro.png"
          alt=""
          className="max-w-none object-contain"
          style={{ width: tamanho, height: tamanho }}
        />
      </span>
    </span>
  );
}

export function DiscoRating({
  nota,
  tamanho = 18,
  mostrarNumero = true,
}: {
  nota: number;
  tamanho?: number;
  mostrarNumero?: boolean;
}) {
  return (
    <div
      role="img"
      aria-label={`Nota ${formatarNota(nota)} de 5`}
      className="flex items-center gap-1"
    >
      <div className="flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <Disco key={i} preenchimento={nota - i} tamanho={tamanho} />
        ))}
      </div>
      {mostrarNumero && (
        <span className="ml-1 text-xs font-semibold text-amber-200">
          {formatarNota(nota)}
        </span>
      )}
    </div>
  );
}

export function DiscoRatingInput({
  valor,
  onChange,
  tamanho = 36,
}: {
  valor: number;
  onChange: (nota: number) => void;
  tamanho?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const atual = hover ?? valor;

  const botao =
    "absolute inset-y-0 cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400";

  return (
    <div
      role="group"
      aria-label="Escolha sua nota de 0,5 a 5"
      onMouseLeave={() => setHover(null)}
      className="flex items-center gap-1"
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="relative inline-block"
          style={{ width: tamanho, height: tamanho }}
        >
          <Disco preenchimento={atual - i} tamanho={tamanho} />

          {[i + 0.5, i + 1].map((n, lado) => (
            <button
              key={n}
              type="button"
              aria-label={`Nota ${formatarNota(n)}`}
              aria-pressed={valor === n}
              onClick={() => onChange(n)}
              onMouseEnter={() => setHover(n)}
              onFocus={() => setHover(n)}
              onBlur={() => setHover(null)}
              className={`${botao} w-1/2 ${lado === 0 ? "left-0" : "right-0"}`}
            />
          ))}
        </span>
      ))}

      <span className="ml-3 min-w-10 text-lg font-semibold text-amber-200">
        {atual > 0 ? formatarNota(atual) : "–"}
      </span>
    </div>
  );
}
