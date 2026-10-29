import type { Metadata } from "next";
import { exigirAdmin } from "@/lib/sessao";
import { listarGeneros } from "@/lib/catalogo";
import { listarParaAdmin } from "@/lib/catalogo-admin";
import { card, Container } from "@/app/components/ui";
import { BotaoExcluir, FormAlbum, FormArtista, FormMusica } from "./formularios";

export const metadata: Metadata = { title: "Administração | SoundProfile" };

export default async function AdminPage() {
  await exigirAdmin();
  const [generos, catalogo] = await Promise.all([listarGeneros(), listarParaAdmin()]);

  const listas = [
    { titulo: "Artistas", tipo: "artista", itens: catalogo.artistas.map((a) => ({ id: a.id, nome: a.nome })) },
    { titulo: "Álbuns", tipo: "album", itens: catalogo.albuns.map((a) => ({ id: a.id, nome: `${a.artista}: ${a.titulo}` })) },
    { titulo: "Músicas (últimas 100)", tipo: "musica", itens: catalogo.musicas.map((m) => ({ id: m.id, nome: `${m.artista}: ${m.titulo}` })) },
  ];

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <Container className="py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Administração</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
          Cadastre o conteúdo do catálogo. Comece pelo artista, depois cadastre os álbuns e as músicas dele.
          Para moderar uma avaliação, abra a página do item e use “Remover (moderação)”.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <FormArtista generos={generos.map((g) => ({ id: g.idGenero, nome: g.nome }))} />
          <FormAlbum artistas={catalogo.artistas} />
          <FormMusica artistas={catalogo.artistas} albuns={catalogo.albuns} />
        </div>

        <h2 className="mb-4 mt-12 text-xl font-semibold">Conteúdo cadastrado</h2>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {listas.map((l) => (
            <section key={l.tipo} className={`${card} min-w-0 p-5`}>
              <h3 className="mb-3 font-semibold">{l.titulo} <span className="text-sm font-normal text-white/35">({l.itens.length})</span></h3>
              {l.itens.length === 0 ? (
                <p className="text-sm text-white/40">Nada cadastrado.</p>
              ) : (
                <ul className="max-h-80 space-y-1 overflow-y-auto">
                  {l.itens.map((i) => (
                    <li key={i.id} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-white/[0.04]">
                      <span className="min-w-0 truncate text-sm">{i.nome}</span>
                      <BotaoExcluir tipo={l.tipo} id={i.id} nome={i.nome} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </Container>
    </main>
  );
}
