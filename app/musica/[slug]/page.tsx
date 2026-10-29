import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buscarMusica } from "@/lib/catalogo";
import { carregarDadosItem } from "@/lib/pagina-item";
import { obterUsuarioLogado } from "@/lib/sessao";
import { ColunaAvaliacao, SecaoAvaliacoes } from "@/app/components/avaliacoes";
import { ChipsGenero, Container, HeroItem, MediaDestaque, TituloSecao } from "@/app/components/ui";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const musica = await buscarMusica((await params).slug);
  return musica ? { title: `${musica.titulo}, ${musica.artista} | SoundProfile` } : {};
}

export default async function MusicaPage({ params }: Props) {
  const musica = await buscarMusica((await params).slug);
  if (!musica) notFound();

  const usuario = await obterUsuarioLogado();
  const dados = await carregarDadosItem("musica", musica.idMusica, usuario?.idUsuario ?? null);

  return (
    <main className="min-h-screen bg-[#09090b] text-white selection:bg-violet-500/40">
      <HeroItem imagem={musica.capa} nome={musica.titulo} titulo={musica.titulo}>
        <p className="mt-2 text-lg text-white/70">
          <Link href={`/artista/${musica.artistaSlug}`} className="font-medium text-white hover:text-violet-300">{musica.artista}</Link>
          {musica.albumSlug && (
            <>
              <span className="mx-2 text-white/30">em</span>
              <Link href={`/album/${musica.albumSlug}`} className="hover:text-violet-300">{musica.albumTitulo}</Link>
            </>
          )}
        </p>
        <div className="mt-3"><ChipsGenero generos={musica.generos} /></div>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
          <MediaDestaque media={dados.stats.media} total={dados.stats.total} />
          <a href="#sua-avaliacao" className="rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold transition hover:bg-violet-500">
            {dados.minha ? "Ver sua avaliação" : "Avaliar esta música"}
          </a>
        </div>
      </HeroItem>

      <Container className="grid gap-8 py-10 lg:grid-cols-[1fr_340px]">
        <section className="min-w-0">
          <TituloSecao titulo="Avaliações da comunidade" />
          <SecaoAvaliacoes tipo="musica" idItem={musica.idMusica} avaliacoes={dados.avaliacoes} usuarioId={usuario?.idUsuario ?? null} ehAdmin={usuario?.role === "admin"} />
        </section>

        <ColunaAvaliacao tipo="musica" idItem={musica.idMusica} nomeItem="esta música" stats={dados.stats} minha={dados.minha} favorito={dados.favorito} usuarioId={usuario?.idUsuario ?? null} />
      </Container>
    </main>
  );
}
