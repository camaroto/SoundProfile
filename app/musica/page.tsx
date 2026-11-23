import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { contagens, listarAlbuns, listarArtistas, listarGeneros, listarMusicas } from "@/lib/catalogo";
import { ehTipo } from "@/lib/constantes";
import { obterUsuarioLogado } from "@/lib/sessao";
import CabecalhoMusicas from "@/app/components/cabecalho-musicas";
import { card, CartaoAlbum, CartaoArtista, Container, EstadoVazio, LinhaMusica, TituloSecao } from "@/app/components/ui";
import ListaCompleta from "./lista-completa";

export const metadata: Metadata = {
  title: "Músicas | SoundProfile",
  description: "Explore álbuns, artistas e músicas e veja as avaliações da comunidade.",
};

type Props = { searchParams: Promise<{ tipo?: string; ordem?: string; pagina?: string }> };

export default async function MusicasPage({ searchParams }: Props) {
  const sp = await searchParams;
  const tipo = ehTipo(sp.tipo) ? sp.tipo : undefined;
  const ordem = sp.ordem === "melhores" ? "melhores" : "recentes";
  const pagina = Math.max(1, Number(sp.pagina) || 1);

  // Os endereços antigos (/musica?tipo=album e /musica?tipo=artista) agora são rotas próprias.
  if (tipo === "album" || tipo === "artista") {
    redirect(`/${tipo === "album" ? "albuns" : "artistas"}?ordem=${ordem}&pagina=${pagina}`);
  }

  const [usuario, generos, totais] = await Promise.all([obterUsuarioLogado(), listarGeneros(), contagens()]);
  const semConteudo = totais.artistas + totais.albuns + totais.musicas === 0;

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <Container className="py-10">
        <CabecalhoMusicas ativa={tipo === "musica" ? "musica" : "geral"} />

        {semConteudo ? (
          <div className="mt-10">
            <EstadoVazio
              titulo="Ainda não há músicas cadastradas"
              texto="O catálogo está vazio. Busque uma música no Spotify para trazê-la para cá, ou aguarde o catálogo inicial."
              acao={usuario?.role === "admin" ? { href: "/admin", rotulo: "Cadastrar conteúdo" } : { href: "/buscar", rotulo: "Buscar" }}
            />
          </div>
        ) : tipo === "musica" ? (
          <ListaCompleta tipo="musica" base="/musica?tipo=musica" ordem={ordem} pagina={pagina} />
        ) : (
          <>
            <section className="mt-10">
              <TituloSecao titulo="Gêneros" acao={{ href: "/generos", rotulo: "Ver todos" }} />
              <ul className="flex flex-wrap gap-2">
                {generos.slice(0, 12).map((g) => (
                  <li key={g.slug}>
                    <Link
                      href={`/generos/${g.slug}`}
                      className="inline-block rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm transition hover:border-violet-400/40 hover:bg-violet-500/10"
                    >
                      {g.nome}
                    </Link>
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
          <TituloSecao titulo="Mais bem avaliados" descricao="Álbuns com as melhores médias da comunidade." acao={{ href: "/albuns?ordem=melhores", rotulo: "Ver todos" }} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{comNota.map((a) => <CartaoAlbum key={a.idAlbum} album={a} />)}</div>
        </section>
      )}
      {albuns.itens.length > 0 && (
        <section>
          <TituloSecao titulo="Álbuns recentes" acao={{ href: "/albuns", rotulo: "Ver todos" }} />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{albuns.itens.map((a) => <CartaoAlbum key={a.idAlbum} album={a} />)}</div>
        </section>
      )}
      {artistas.itens.length > 0 && (
        <section>
          <TituloSecao titulo="Artistas" acao={{ href: "/artistas", rotulo: "Ver todos" }} />
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
