import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { albunsDoArtista, buscarArtista, musicasDoArtista } from "@/lib/catalogo";
import { carregarDadosItem } from "@/lib/pagina-item";
import { obterUsuarioLogado } from "@/lib/sessao";
import { ColunaAvaliacao, SecaoAvaliacoes } from "@/app/components/avaliacoes";
import { card, CartaoAlbum, ChipsGenero, Container, EstadoVazio, HeroItem, LinhaMusica, MediaDestaque, TituloSecao } from "@/app/components/ui";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const artista = await buscarArtista((await params).slug);
  return artista ? { title: `${artista.nome} | SoundProfile` } : {};
}

export default async function ArtistaPage({ params }: Props) {
  const artista = await buscarArtista((await params).slug);
  if (!artista) notFound();

  const usuario = await obterUsuarioLogado();
  const [albuns, musicas, dados] = await Promise.all([
    albunsDoArtista(artista.idArtista),
    musicasDoArtista(artista.idArtista),
    carregarDadosItem("artista", artista.idArtista, usuario?.idUsuario ?? null),
  ]);

  return (
    <main className="min-h-screen bg-[#09090b] text-white selection:bg-violet-500/40">
      <HeroItem imagem={artista.imagem} nome={artista.nome} titulo={artista.nome} redondo>
        <div className="mt-3"><ChipsGenero generos={artista.generos} /></div>
        {artista.biografia && <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-6 text-white/60">{artista.biografia}</p>}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
          <MediaDestaque media={dados.stats.media} total={dados.stats.total} />
          <a href="#sua-avaliacao" className="rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold transition hover:bg-violet-500">
            {dados.minha ? "Ver sua avaliação" : "Avaliar este artista"}
          </a>
        </div>
      </HeroItem>

      <Container className="grid gap-8 py-10 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-10">
          <section>
            <TituloSecao titulo="Álbuns" />
            {albuns.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {albuns.map((a) => <CartaoAlbum key={a.idAlbum} album={a} />)}
              </div>
            ) : (
              <EstadoVazio titulo="Nenhum álbum cadastrado" />
            )}
          </section>

          {musicas.length > 0 && (
            <section>
              <TituloSecao titulo="Músicas" />
              <ul className={`${card} overflow-hidden`}>
                {musicas.map((m) => <LinhaMusica key={m.idMusica} musica={m} />)}
              </ul>
            </section>
          )}

          <section>
            <TituloSecao titulo="Avaliações da comunidade" />
            <SecaoAvaliacoes tipo="artista" idItem={artista.idArtista} avaliacoes={dados.avaliacoes} usuarioId={usuario?.idUsuario ?? null} ehAdmin={usuario?.role === "admin"} />
          </section>
        </div>

        <ColunaAvaliacao tipo="artista" idItem={artista.idArtista} nomeItem="este artista" stats={dados.stats} minha={dados.minha} favorito={dados.favorito} usuarioId={usuario?.idUsuario ?? null} />
      </Container>
    </main>
  );
}
