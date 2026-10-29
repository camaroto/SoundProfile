import type { Metadata } from "next";
import Link from "next/link";
import { contagens, listarAlbuns, listarArtistas, listarGeneros, listarMusicas } from "@/lib/catalogo";
import { ehTipo, ROTULO_PLURAL, type TipoItem } from "@/lib/constantes";
import { obterUsuarioLogado } from "@/lib/sessao";
import { card, CartaoAlbum, CartaoArtista, Container, EstadoVazio, LinhaMusica, Paginacao, TituloSecao } from "@/app/components/ui";

export const metadata: Metadata = {
  title: "Músicas | SoundProfile",
  description: "Explore álbuns, artistas e músicas e veja as avaliações da comunidade.",
};

type Props = { searchParams: Promise<{ tipo?: string; ordem?: string; pagina?: string }> };

const LIMITE = 24;

function Abas({ tipo }: { tipo?: TipoItem }) {
  const itens: { rotulo: string; href: string; ativo: boolean }[] = [
    { rotulo: "Visão geral", href: "/musica", ativo: !tipo },
    { rotulo: "Álbuns", href: "/musica?tipo=album", ativo: tipo === "album" },
    { rotulo: "Artistas", href: "/musica?tipo=artista", ativo: tipo === "artista" },
    { rotulo: "Músicas", href: "/musica?tipo=musica", ativo: tipo === "musica" },
  ];
  return (
    <nav aria-label="Seções de música" className="flex gap-2 overflow-x-auto pb-1">
      {itens.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          aria-current={i.ativo ? "page" : undefined}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
            i.ativo ? "border-violet-400/50 bg-violet-500/20 text-white" : "border-white/10 text-white/60 hover:border-violet-400/30 hover:text-white"
          }`}
        >
          {i.rotulo}
        </Link>
      ))}
    </nav>
  );
}

export default async function MusicasPage({ searchParams }: Props) {
  const sp = await searchParams;
  const tipo = ehTipo(sp.tipo) ? sp.tipo : undefined;
  const ordem = sp.ordem === "melhores" ? "melhores" : "recentes";
  const pagina = Math.max(1, Number(sp.pagina) || 1);

  const [usuario, generos, totais] = await Promise.all([obterUsuarioLogado(), listarGeneros(), contagens()]);
  const semConteudo = totais.artistas + totais.albuns + totais.musicas === 0;

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <Container className="py-10">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Músicas</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">Explore álbuns, artistas e músicas e veja o que a comunidade acha.</p>

        <form action="/buscar" role="search" className="mt-6 flex max-w-xl gap-2">
          <label htmlFor="busca" className="sr-only">Buscar músicas, artistas, álbuns e membros</label>
          <input id="busca" name="q" type="search" placeholder="Buscar artistas, álbuns, músicas..." className="min-w-0 flex-1 rounded-lg border border-white/10 bg-neutral-800 p-3 text-white outline-none placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30" />
          <button type="submit" className="rounded-lg bg-violet-600 px-5 text-sm font-semibold transition hover:bg-violet-500">Buscar</button>
        </form>

        <div className="mt-6"><Abas tipo={tipo} /></div>

        {semConteudo ? (
          <div className="mt-10">
            <EstadoVazio
              titulo="Ainda não há músicas cadastradas"
              texto="O catálogo está vazio. Os álbuns, artistas e músicas aparecem aqui assim que forem cadastrados."
              acao={usuario?.role === "admin" ? { href: "/admin", rotulo: "Cadastrar conteúdo" } : undefined}
            />
          </div>
        ) : tipo ? (
          <ListaCompleta tipo={tipo} ordem={ordem} pagina={pagina} />
        ) : (
          <>
            <section className="mt-10">
              <TituloSecao titulo="Gêneros" acao={{ href: "/generos", rotulo: "Ver todos" }} />
              <ul className="flex flex-wrap gap-2">
                {generos.slice(0, 12).map((g) => (
                  <li key={g.slug}>
                    <Link href={`/generos/${g.slug}`} className="inline-block rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm transition hover:border-violet-400/40 hover:bg-violet-500/10">{g.nome}</Link>
                  </li>
                ))}
              </ul>
            </section>
            <Visao />
          </>
        )}
      </Container>
    </main>
  );
}

async function ListaCompleta({ tipo, ordem, pagina }: { tipo: TipoItem; ordem: "melhores" | "recentes"; pagina: number }) {
  const opcoes = { ordem, pagina, limite: LIMITE };
  const href = (p: number) => `/musica?tipo=${tipo}&ordem=${ordem}&pagina=${p}`;
  const resultado = tipo === "album" ? await listarAlbuns(opcoes) : tipo === "artista" ? await listarArtistas(opcoes) : await listarMusicas(opcoes);

  return (
    <section className="mt-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <TituloSecao titulo={ROTULO_PLURAL[tipo]} descricao={`${resultado.total} no catálogo`} />
        <div className="flex gap-2 text-sm">
          {(["recentes", "melhores"] as const).map((o) => (
            <Link key={o} href={`/musica?tipo=${tipo}&ordem=${o}`} aria-current={ordem === o ? "true" : undefined} className={`rounded-lg px-3 py-1.5 ${ordem === o ? "bg-white/10 text-white" : "text-white/45 hover:text-white"}`}>
              {o === "recentes" ? "Mais recentes" : "Mais bem avaliados"}
            </Link>
          ))}
        </div>
      </div>

      {resultado.total === 0 ? (
        <EstadoVazio titulo={`Nenhum item em ${ROTULO_PLURAL[tipo].toLowerCase()}`} />
      ) : tipo === "musica" ? (
        <ul className={`${card} overflow-hidden`}>{(resultado.itens as Awaited<ReturnType<typeof listarMusicas>>["itens"]).map((m) => <LinhaMusica key={m.idMusica} musica={m} />)}</ul>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {tipo === "album"
            ? (resultado.itens as Awaited<ReturnType<typeof listarAlbuns>>["itens"]).map((a) => <CartaoAlbum key={a.idAlbum} album={a} />)
            : (resultado.itens as Awaited<ReturnType<typeof listarArtistas>>["itens"]).map((a) => <CartaoArtista key={a.idArtista} artista={a} />)}
        </div>
      )}
      <Paginacao total={resultado.total} limite={LIMITE} pagina={pagina} href={href} />
    </section>
  );
}

async function Visao() {
  const [melhores, albuns, artistas, musicas] = await Promise.all([
    listarAlbuns({ ordem: "melhores", limite: 4 }),
    listarAlbuns({ limite: 8 }),
    listarArtistas({ limite: 6 }),
    listarMusicas({ limite: 6 }),
  ]);
  const comNota = melhores.itens.filter((a) => a.media !== null);

  return (
    <div className="mt-12 space-y-12">
      {comNota.length > 0 && (
        <section>
          <TituloSecao titulo="Mais bem avaliados" descricao="Álbuns com as melhores médias da comunidade." acao={{ href: "/musica?tipo=album&ordem=melhores", rotulo: "Ver todos" }} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{comNota.map((a) => <CartaoAlbum key={a.idAlbum} album={a} />)}</div>
        </section>
      )}
      {albuns.itens.length > 0 && (
        <section>
          <TituloSecao titulo="Álbuns recentes" acao={{ href: "/musica?tipo=album", rotulo: "Ver todos" }} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{albuns.itens.map((a) => <CartaoAlbum key={a.idAlbum} album={a} />)}</div>
        </section>
      )}
      {artistas.itens.length > 0 && (
        <section>
          <TituloSecao titulo="Artistas" acao={{ href: "/musica?tipo=artista", rotulo: "Ver todos" }} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">{artistas.itens.map((a) => <CartaoArtista key={a.idArtista} artista={a} />)}</div>
        </section>
      )}
      {musicas.itens.length > 0 && (
        <section>
          <TituloSecao titulo="Músicas" acao={{ href: "/musica?tipo=musica", rotulo: "Ver todas" }} />
          <ul className={`${card} overflow-hidden`}>{musicas.itens.map((m) => <LinhaMusica key={m.idMusica} musica={m} />)}</ul>
        </section>
      )}
    </div>
  );
}
