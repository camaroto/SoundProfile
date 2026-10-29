import type { Metadata } from "next";
import Link from "next/link";
import { listarGeneros } from "@/lib/catalogo";
import { Container } from "@/app/components/ui";

export const metadata: Metadata = {
  title: "Gêneros | SoundProfile",
  description: "Explore artistas e álbuns por gênero musical.",
};

export default async function GenerosPage() {
  const generos = await listarGeneros();

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <Container className="py-10">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Gêneros</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">Escolha um gênero para ver os artistas e álbuns dele.</p>

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {generos.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/generos/${g.slug}`}
                className="group block h-full rounded-2xl border border-white/[0.08] bg-gradient-to-br from-violet-950/60 via-[#171020] to-fuchsia-950/40 p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                <h2 className="text-lg font-semibold group-hover:text-violet-200">{g.nome}</h2>
                <p className="mt-2 text-xs text-white/45">
                  {g.artistas === 0 && g.albuns === 0
                    ? "Nada cadastrado ainda"
                    : `${g.artistas} artista${g.artistas === 1 ? "" : "s"}, ${g.albuns} álbu${g.albuns === 1 ? "m" : "ns"}`}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </main>
  );
}
