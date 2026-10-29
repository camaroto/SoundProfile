import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buscarGenero, listarAlbuns, listarArtistas, listarMusicas } from "@/lib/catalogo";
import { card, CartaoAlbum, CartaoArtista, Container, EstadoVazio, LinhaMusica, TituloSecao } from "@/app/components/ui";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const genero = await buscarGenero((await params).slug);
  return genero ? { title: `${genero.nome} | SoundProfile` } : {};
}

export default async function GeneroPage({ params }: Props) {
  const slug = (await params).slug;
  const genero = await buscarGenero(slug);
  if (!genero) notFound();

  const [artistas, albuns, musicas] = await Promise.all([
    listarArtistas({ genero: slug, ordem: "melhores", limite: 12 }),
    listarAlbuns({ genero: slug, ordem: "melhores", limite: 12 }),
    listarMusicas({ genero: slug, ordem: "melhores", limite: 10 }),
  ]);
  const vazio = artistas.total + albuns.total + musicas.total === 0;

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <Container className="py-10">
        <Link href="/generos" className="text-sm text-violet-400 hover:text-violet-300">← Todos os gêneros</Link>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{genero.nome}</h1>

        {vazio ? (
          <div className="mt-10">
            <EstadoVazio titulo={`Nada em ${genero.nome} ainda`} texto="Quando artistas e álbuns deste gênero forem cadastrados, eles aparecem aqui." acao={{ href: "/generos", rotulo: "Ver outros gêneros" }} />
          </div>
        ) : (
          <div className="mt-10 space-y-12">
            {artistas.itens.length > 0 && (
              <section>
                <TituloSecao titulo="Artistas" descricao={`${artistas.total} em ${genero.nome}`} />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">{artistas.itens.map((a) => <CartaoArtista key={a.idArtista} artista={a} />)}</div>
              </section>
            )}
            {albuns.itens.length > 0 && (
              <section>
                <TituloSecao titulo="Álbuns" descricao={`${albuns.total} em ${genero.nome}`} />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{albuns.itens.map((a) => <CartaoAlbum key={a.idAlbum} album={a} />)}</div>
              </section>
            )}
            {musicas.itens.length > 0 && (
              <section>
                <TituloSecao titulo="Músicas" />
                <ul className={`${card} overflow-hidden`}>{musicas.itens.map((m) => <LinhaMusica key={m.idMusica} musica={m} />)}</ul>
              </section>
            )}
          </div>
        )}
      </Container>
    </main>
  );
}
