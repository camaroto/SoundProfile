"use client";

import { usePathname } from "next/navigation";

// A conversa individual ocupa a altura toda da tela, então o rodapé some só nela
// (/social/mensagens/123). A lista de conversas e o resto do site continuam com rodapé.
const CONVERSA = /^\/social\/mensagens\/\d+(\/|$)/;

export default function OcultarNaConversa({ children }: { children: React.ReactNode }) {
  const caminho = usePathname();
  if (CONVERSA.test(caminho)) return null;
  return <>{children}</>;
}
