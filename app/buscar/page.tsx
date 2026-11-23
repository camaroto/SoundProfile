import type { Metadata } from "next";
import Link from "next/link";

import { api } from "@/lib/api";
import { listarAlbuns, listarArtistas, listarMusicas } from "@/lib/catalogo";
import { listarMembros } from "@/lib/comunidade";

import FormBusca from "@/app/components/form-busca";
import { card, CartaoAlbum, CartaoArtista, Capa, Container, EstadoVazio, LinhaMusica, TituloSecao } from "@/app/components/ui";

import LinhaSpotify, { type SpotifyMusica } from "./linha-spotify";

export const metadata: Metadata = {
  title: "Buscar | SoundProfile",
};

type Props = { searchParams: Promise<{ q?: string; erro?: string }> };

// "Numb (Remastered)" e "numb" contam como a mesma música ao tirar do Spotify o que o catálogo já mostra.
const chave = (titulo: string, artista: string) =>
  `${titulo}|${artista}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\(.*?\)|\[.*?\]/g, " ")
    .replace(/[^a-z0-9|]+/g, " ")
    .trim();

export default async function BuscarPage({ searchParams }: Props) {
  const parametros = await searchParams;
  const q = (parametros.q ?? "").trim().slice(0, 80);

  const [artistas, albuns, musicas, membros, noSpotify] = q
    ? await Promise.all([
        listarArtistas({ q, limite: 6 }),
        listarAlbuns({ q, limite: 8 }),
        listarMusicas({ q, limite: 8 }),
        listarMembros({ q, limite: 8 }),
        api<SpotifyMusica[]>(`/api/spotify/search?q=${encodeURIComponent(q)}`).catch(() => [] as SpotifyMusica[]),
      ])
    : [null, null, null, null, [] as SpotifyMusica[]];

  // Músicas do Spotify que ainda não estão no catálogo (as que já estão aparecem na seção "Músicas").
  const jaNoCatalogo = new Set((musicas?.itens ?? []).map((m) => chave(m.titulo, m.artista)));
  const spotifyNovas = noSpotify.filter((m) => !jaNoCatalogo.has(chave(m.nome, m.artista)));

  const nada = q && artistas!.total + albuns!.total + musicas!.total + membros!.length + spotifyNovas.length === 0;

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <Container className="py-10">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Buscar</h1>

        <div className="mt-6">
          <FormBusca q={q} autoFocus />
        </div>

        {parametros.erro && (
          <p role="alert" className="mt-6 max-w-xl rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-300">
            {parametros.erro}
          </p>
        )}

        {!q && <p className="mt-8 text-sm text-white/45">Digite um nome para buscar.</p>}

        {nada && (
          <div className="mt-8">
            <EstadoVazio titulo={`Nada encontrado para “${q}”`} texto="Confira a grafia ou tente outro termo." />
          </div>
        )}

        {q && !nada && (
          <div className="mt-10 space-y-12">
            {artistas!.itens.length > 0 && (
              <section>
                <TituloSecao titulo="Artistas" />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                  {artistas!.itens.map((a) => (
                    <CartaoArtista key={a.idArtista} artista={a} />
                  ))}
                </div>
              </section>
            )}

            {albuns!.itens.length > 0 && (
              <section>
                <TituloSecao titulo="Álbuns" />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {albuns!.itens.map((a) => (
                    <CartaoAlbum key={a.idAlbum} album={a} />
                  ))}
                </div>
              </section>
            )}

            {musicas!.itens.length > 0 && (
              <section>
                <TituloSecao titulo="Músicas" />
                <ul className={`${card} overflow-hidden`}>
                  {musicas!.itens.map((m) => (
                    <LinhaMusica key={m.idMusica} musica={m} avaliar />
                  ))}
                </ul>
              </section>
            )}

            {spotifyNovas.length > 0 && (
              <section>
                <TituloSecao titulo="Mais no Spotify" descricao="Toque em Avaliar para trazer a música para o SoundProfile." />
                <ul className={`${card} overflow-hidden`}>
                  {spotifyNovas.map((m) => (
                    <LinhaSpotify key={m.spotifyId} musica={m} q={q} />
                  ))}
                </ul>
                <p className="mt-3 text-xs text-white/35">Dados do Spotify. Prévias de 30 segundos fornecidas pelo Deezer.</p>
              </section>
            )}

            {membros!.length > 0 && (
              <section>
                <TituloSecao titulo="Membros" />
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {membros!.map((m) => (
                    <li key={m.idUsuario}>
                      <Link
                        href={`/perfil/${m.username}`}
                        className={`${card} flex items-center gap-3 p-4 transition hover:border-violet-400/25 hover:bg-white/[0.045]`}
                      >
                        <Capa src={m.avatar} nome={m.nomeExibicao || m.username} alt="" className="h-12 w-12 shrink-0 rounded-full" />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{m.nomeExibicao || m.username}</p>
                          <p className="truncate text-sm text-white/40">@{m.username}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </Container>
    </main>
  );
}
