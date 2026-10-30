"use client";

import { useFormStatus } from "react-dom";

// Botão de formulário que mostra feedback enquanto a ação está em andamento.
export default function BotaoSubmit({
  children,
  pendente = "Aguarde…",
  className = "",
}: {
  children: React.ReactNode;
  pendente?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={`${className} disabled:cursor-wait disabled:opacity-60`}>
      {pending ? pendente : children}
    </button>
  );
}
