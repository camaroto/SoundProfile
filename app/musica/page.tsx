import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DiscoRating } from "@/app/components/disco-rating";
import { formatarNota } from "@/app/components/disco-rating/formatar";
import { albuns, resumoNotas } from "./dados";

export const metadata: Metadata = {
  title: "Músicas | SoundProfile",
  description: "Explore álbuns e veja as avaliações da comunidade.",
};

export default function MusicasPage() {
  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-10">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Músicas
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
          Escolha um álbum para ver as faixas, ler as avaliações e dar a sua nota.
        </p>

        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {albuns.map((album) => {
            const { media, total } = resumoNotas(album.distribuicao);

            return (
              <li key={album.slug}>
                <Link
                  href={`/musica/${album.slug}`}
                  className="group block rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3 transition duration-300 hover:-translate-y-1 hover:border-violet-400/25 hover:bg-white/[0.045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-[#181321]">
                    <Image
                      src={album.capa}
                      alt={`Capa do álbum ${album.titulo}`}
                      fill
                      sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h2 className="mt-3 truncate text-sm font-medium">
                    {album.titulo}
                  </h2>
                  <p className="mt-0.5 truncate text-xs text-white/45">
                    {album.artista}, {album.ano}
                  </p>
                  <div className="mt-2">
                    <DiscoRating nota={media} tamanho={14} />
                  </div>
                  <p className="mt-1 text-[11px] text-white/30">
                    {total.toLocaleString("pt-BR")} avaliações, média {formatarNota(media)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
