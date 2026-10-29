import type { Metadata } from "next";
import Link from "next/link";
import { listarAlbuns, listarArtistas, listarMusicas } from "@/lib/catalogo";
import { listarMembros } from "@/lib/comunidade";
import { card, CartaoAlbum, CartaoArtista, Capa, Container, EstadoVazio, LinhaMusica, TituloSecao } from "@/app/components/ui";

export const metadata: Metadata = { title: "Buscar | SoundProfile" };

type Props = { searchParams: Promise<{ q?: string }> };

export default async function BuscarPage({ searchParams }: Props) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 80);

  const [artistas, albuns, musicas, membros] = q
    ? await Promise.all([
        listarArtistas({ q, limite: 6 }),
        listarAlbuns({ q, limite: 8 }),
        listarMusicas({ q, limite: 8 }),
        listarMembros({ q, limite: 8 }),
      ])
    : [null, null, null, null];

  const nada = q && artistas!.total + albuns!.total + musicas!.total + membros!.length === 0;

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <Container className="py-10">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Buscar</h1>

        <form role="search" className="mt-6 flex max-w-xl gap-2">
          <label htmlFor="q" className="sr-only">Buscar</label>
          <input id="q" name="q" type="search" defaultValue={q} autoFocus placeholder="Artistas, álbuns, músicas, membros..." className="min-w-0 flex-1 rounded-lg border border-white/10 bg-neutral-800 p-3 text-white outline-none placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30" />
          <button type="submit" className="rounded-lg bg-violet-600 px-5 text-sm font-semibold transition hover:bg-violet-500">Buscar</button>
        </form>

        {!q && <p className="mt-8 text-sm text-white/45">Digite um nome para buscar.</p>}
        {nada && <div className="mt-8"><EstadoVazio titulo={`Nada encontrado para “${q}”`} texto="Confira a grafia ou tente outro termo." /></div>}

        {q && !nada && (
          <div className="mt-10 space-y-12">
            {artistas!.itens.length > 0 && (
              <section>
                <TituloSecao titulo="Artistas" />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">{artistas!.itens.map((a) => <CartaoArtista key={a.idArtista} artista={a} />)}</div>
              </section>
            )}
            {albuns!.itens.length > 0 && (
              <section>
                <TituloSecao titulo="Álbuns" />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{albuns!.itens.map((a) => <CartaoAlbum key={a.idAlbum} album={a} />)}</div>
              </section>
            )}
            {musicas!.itens.length > 0 && (
              <section>
                <TituloSecao titulo="Músicas" />
                <ul className={`${card} overflow-hidden`}>{musicas!.itens.map((m) => <LinhaMusica key={m.idMusica} musica={m} />)}</ul>
              </section>
            )}
            {membros!.length > 0 && (
              <section>
                <TituloSecao titulo="Membros" />
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {membros!.map((m) => (
                    <li key={m.idUsuario}>
                      <Link href={`/perfil/${m.username}`} className={`${card} flex items-center gap-3 p-4 transition hover:border-violet-400/25 hover:bg-white/[0.045]`}>
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
