// Quantas avaliações um item precisa ter para exibirmos a "média da comunidade".
// Com menos que isso a média engana, então mostramos só a quantidade.
export const MINIMO_PARA_MEDIA = 3;

export const TIPOS = ["artista", "album", "musica"] as const;
export type TipoItem = (typeof TIPOS)[number];

// Listas fixas: nunca montamos SQL com texto vindo do usuário.
export const COLUNA: Record<TipoItem, string> = {
  artista: "idArtista",
  album: "idAlbum",
  musica: "idMusica",
};
// Primeiro trecho do endereço de cada tipo: /artista/x, /album/x, /musica/x.
export const ROTA: Record<TipoItem, string> = {
  artista: "artista",
  album: "album",
  musica: "musica",
};
export const ROTULO: Record<TipoItem, string> = {
  artista: "Artista",
  album: "Álbum",
  musica: "Música",
};
export const ROTULO_PLURAL: Record<TipoItem, string> = {
  artista: "Artistas",
  album: "Álbuns",
  musica: "Músicas",
};

export function ehTipo(valor: unknown): valor is TipoItem {
  return typeof valor === "string" && (TIPOS as readonly string[]).includes(valor);
}

export type Periodo = "7d" | "30d" | "tudo";
export const PERIODOS: { valor: Periodo; rotulo: string }[] = [
  { valor: "7d", rotulo: "Últimos 7 dias" },
  { valor: "30d", rotulo: "Últimos 30 dias" },
  { valor: "tudo", rotulo: "Histórico geral" },
];

export function lerPeriodo(valor: string | undefined): Periodo {
  return valor === "7d" || valor === "30d" ? valor : "tudo";
}

export function inicioDoPeriodo(periodo: Periodo): Date | null {
  if (periodo === "tudo") return null;
  const dias = periodo === "7d" ? 7 : 30;
  return new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
}

// Para busca com ILIKE: evita que % e _ digitados virem curingas.
export function padraoBusca(q: string): string {
  return `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

export const NOTAS_VALIDAS = Array.from({ length: 10 }, (_, i) => (i + 1) / 2);
