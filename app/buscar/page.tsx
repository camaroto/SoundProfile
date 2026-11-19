
import type { Metadata } from "next";
import Link from "next/link";

import { api } from "@/lib/api";
import { listarAlbuns, listarArtistas, listarMusicas } from "@/lib/catalogo";
import { listarMembros } from "@/lib/comunidade";
import { obterUsuarioLogado } from "@/lib/sessao";

import {
  card,
  CartaoAlbum,
  CartaoArtista,
  Capa,
  Container,
  EstadoVazio,
  LinhaMusica,
  TituloSecao,
} from "@/app/components/ui";

import { importarMusicasSpotify } from "./actions";

export const metadata: Metadata = {
  title: "Buscar | SoundProfile",
};

type Props = {
  searchParams: Promise<{
    q?: string;
    importadas?: string;
    erro?: string;
  }>;
};

type SpotifyMusica = {
  spotifyId: string;
  nome: string;
  artista: string;
  album: string;
  imagem: string;
  duracaoMs: number | null;
  urlSpotify: string;
};

function formatarDuracao(ms: number | null) {
  if (!ms) return "--:--";

  const segundos = Math.floor(ms / 1000);
  const minutos = Math.floor(segundos / 60);
  const restante = segundos % 60;

  return `${minutos}:${String(restante).padStart(2, "0")}`;
}

export default async function BuscarPage({ searchParams }: Props) {
  const parametros = await searchParams;

  const q = (parametros.q ?? "").trim().slice(0, 80);

  const usuario = await obterUsuarioLogado();

  const [artistas, albuns, musicas, membros, spotifyMusicas] = q
    ? await Promise.all([
        listarArtistas({ q, limite: 6 }),
        listarAlbuns({ q, limite: 8 }),
        listarMusicas({ q, limite: 8 }),
        listarMembros({ q, limite: 8 }),
        api<SpotifyMusica[]>(
          `/api/spotify/search?q=${encodeURIComponent(q)}`
        ).catch(() => []),
      ])
    : [null, null, null, null, []];

  const nada =
    q &&
    artistas!.total +
      albuns!.total +
      musicas!.total +
      membros!.length +
      spotifyMusicas.length ===
      0;

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <Container className="py-10">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Buscar
        </h1>

        <form role="search" className="mt-6 flex max-w-xl gap-2">
          <label htmlFor="q" className="sr-only">
            Buscar
          </label>

          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            autoFocus
            placeholder="Artistas, álbuns, músicas, membros..."
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-neutral-800 p-3 text-white outline-none placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
          />

          <button
            type="submit"
            className="rounded-lg bg-violet-600 px-5 text-sm font-semibold transition hover:bg-violet-500"
          >
            Buscar
          </button>
        </form>

        {parametros.importadas !== undefined && (
          <div className="mt-6 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-300">
            Importação concluída! {parametros.importadas} música(s)
            foram processadas e salvas no catálogo.
          </div>
        )}

        {parametros.erro && (
          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            {parametros.erro}
          </div>
        )}

        {!q && (
          <p className="mt-8 text-sm text-white/45">
            Digite um nome para buscar.
          </p>
        )}

        {nada && (
          <div className="mt-8">
            <EstadoVazio
              titulo={`Nada encontrado para “${q}”`}
              texto="Confira a grafia ou tente outro termo."
            />
          </div>
        )}

        {q && !nada && (
          <div className="mt-10 space-y-12">
            {spotifyMusicas.length > 0 && (
              <section>
                <TituloSecao titulo="Músicas do Spotify" />

                <ul className={`${card} overflow-hidden`}>
                  {spotifyMusicas.map((m) => (
                    <li
                      key={m.spotifyId}
                      className="flex items-center gap-3 border-b border-white/5 p-3 last:border-0"
                    >
                      <Capa
                        src={m.imagem}
                        nome={m.album}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-md"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{m.nome}</p>

                        <p className="truncate text-sm text-white/50">
                          {m.artista} · {m.album}
                        </p>
                      </div>

                      <span className="shrink-0 text-sm text-white/40">
                        {formatarDuracao(m.duracaoMs)}
                      </span>

                      <a
                        href={m.urlSpotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 rounded-lg bg-violet-600/15 px-3 py-2 text-xs font-semibold text-violet-300 transition hover:bg-violet-600/30"
                      >
                        Spotify
                      </a>
                    </li>
                  ))}
                </ul>

                {usuario ? (
                  <form action={importarMusicasSpotify} className="mt-4">
                    <input type="hidden" name="q" value={q} />

                    <button
                      type="submit"
                      className="rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500"
                    >
                      Importar resultados para o catálogo
                    </button>

                    <p className="mt-2 text-xs text-white/40">
                      Serão processados até 10 resultados da pesquisa.
                    </p>
                  </form>
                ) : (
                  <p className="mt-4 text-sm text-white/50">
                    <Link
                      href="/login"
                      className="font-semibold text-violet-300 hover:text-violet-200"
                    >
                      Entre na sua conta
                    </Link>{" "}
                    para importar essas músicas para o catálogo.
                  </p>
                )}
              </section>
            )}

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
                    <LinhaMusica key={m.idMusica} musica={m} />
                  ))}
                </ul>
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
                        <Capa
                          src={m.avatar}
                          nome={m.nomeExibicao || m.username}
                          alt=""
                          className="h-12 w-12 shrink-0 rounded-full"
                        />

                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {m.nomeExibicao || m.username}
                          </p>

                          <p className="truncate text-sm text-white/40">
                            @{m.username}
                          </p>
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