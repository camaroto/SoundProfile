import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buscarAlbum, faixasDoAlbum } from "@/lib/catalogo";
import { carregarDadosItem } from "@/lib/pagina-item";
import { obterUsuarioLogado } from "@/lib/sessao";
import { ColunaAvaliacao, SecaoAvaliacoes } from "@/app/components/avaliacoes";
import { card, ChipsGenero, Container, EstadoVazio, HeroItem, LinhaMusica, MediaDestaque, TituloSecao } from "@/app/components/ui";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const album = await buscarAlbum((await params).slug);
  return album ? { title: `${album.titulo}, ${album.artista} | SoundProfile` } : {};
}

export default async function AlbumPage({ params }: Props) {
  const album = await buscarAlbum((await params).slug);
  if (!album) notFound();

  const usuario = await obterUsuarioLogado();
  const [faixas, dados] = await Promise.all([
    faixasDoAlbum(album.idAlbum),
    carregarDadosItem("album", album.idAlbum, usuario?.idUsuario ?? null),
  ]);

  return (
    <main className="min-h-screen bg-[#09090b] text-white selection:bg-violet-500/40">
      <HeroItem imagem={album.capa} nome={album.titulo} titulo={album.titulo}>
        <p className="mt-2 text-lg text-white/70">
          <Link href={`/artista/${album.artistaSlug}`} className="font-medium text-white hover:text-violet-300">{album.artista}</Link>
          {album.ano && <span className="ml-3 text-white/45">{album.ano}</span>}
        </p>
        <div className="mt-3"><ChipsGenero generos={album.generos} /></div>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
          <MediaDestaque media={dados.stats.media} total={dados.stats.total} />
          <a href="#sua-avaliacao" className="rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold transition hover:bg-violet-500">
            {dados.minha ? "Ver sua avaliação" : "Avaliar este álbum"}
          </a>
        </div>
      </HeroItem>

      <Container className="grid gap-8 py-10 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="faixas">
            <TituloSecao titulo="Faixas" />
            {faixas.length > 0 ? (
              <ol id="faixas" className={`${card} overflow-hidden`}>
                {faixas.map((f) => <LinhaMusica key={f.idMusica} musica={f} mostrarNumero />)}
              </ol>
            ) : (
              <EstadoVazio titulo="Nenhuma faixa cadastrada" texto="As faixas deste álbum ainda não foram adicionadas." />
            )}
          </section>

          <section>
            <TituloSecao titulo="Avaliações da comunidade" />
            <SecaoAvaliacoes tipo="album" idItem={album.idAlbum} avaliacoes={dados.avaliacoes} usuarioId={usuario?.idUsuario ?? null} ehAdmin={usuario?.role === "admin"} />
          </section>
        </div>

        <ColunaAvaliacao tipo="album" idItem={album.idAlbum} nomeItem="este álbum" stats={dados.stats} minha={dados.minha} favorito={dados.favorito} usuarioId={usuario?.idUsuario ?? null} />
      </Container>
    </main>
  );
}
