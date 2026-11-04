// Molduras e balões que o usuário pode escolher no perfil. Esta é a lista permitida:
// o servidor só grava ids que estão aqui (nunca confia no que vem do formulário).
// Sem imports, para servir tanto ao servidor quanto ao navegador.

export const MOLDURAS = [
  { id: "kraken", nome: "Kraken", descricao: "Tentáculos, bolhas e uma bússola flutuando ao redor do perfil.", cores: "from-teal-500 via-cyan-700 to-rose-600" },
  { id: "sakura", nome: "Sakura", descricao: "Flores de cerejeira, pétalas caindo e um anel brilhante na foto.", cores: "from-pink-300 via-pink-500 to-rose-700" },
] as const;

export type IdMoldura = (typeof MOLDURAS)[number]["id"];

export const BALOES = [
  { id: "reticencias", nome: "Digitando…", animado: true, arquivo: "balao.png" },
  { id: "wtf", nome: "WTF?", animado: false, arquivo: "balao-wtf.png" },
  { id: "simbolos", nome: "#@%&!", animado: false, arquivo: "balao-simbolos.png" },
  { id: "fuck", nome: "FUCK", animado: false, arquivo: "balao-fuck.png" },
] as const;

export type IdBalao = (typeof BALOES)[number]["id"];

export function lerMoldura(valor: unknown): IdMoldura | null {
  return MOLDURAS.find((m) => m.id === valor)?.id ?? null;
}

export function lerBalao(valor: unknown): IdBalao | null {
  return BALOES.find((b) => b.id === valor)?.id ?? null;
}
