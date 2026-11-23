import Link from "next/link";

export type AbaMusica = "geral" | "album" | "artista" | "musica";

const ABAS: { id: AbaMusica; rotulo: string; href: string }[] = [
  { id: "geral", rotulo: "Visão geral", href: "/musica" },
  { id: "album", rotulo: "Álbuns", href: "/albuns" },
  { id: "artista", rotulo: "Artistas", href: "/artistas" },
  { id: "musica", rotulo: "Músicas", href: "/musica?tipo=musica" },
];

// Abas da área de músicas. Cada uma é uma rota própria: /musica, /albuns, /artistas e /musica?tipo=musica.
export default function AbasMusica({ ativa }: { ativa: AbaMusica }) {
  return (
    <nav aria-label="Seções de música" className="flex gap-2 overflow-x-auto pb-1">
      {ABAS.map((a) => (
        <Link
          key={a.id}
          href={a.href}
          aria-current={ativa === a.id ? "page" : undefined}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
            ativa === a.id
              ? "border-violet-400/50 bg-violet-500/20 text-white"
              : "border-white/10 text-white/60 hover:border-violet-400/30 hover:text-white"
          }`}
        >
          {a.rotulo}
        </Link>
      ))}
    </nav>
  );
}
