import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { albuns } from "../dados";
import AlbumView from "./album-view";

type Props = { params: Promise<{ slug: string }> };

function buscarAlbum(slug: string) {
  return albuns.find((album) => album.slug === slug);
}

export function generateStaticParams() {
  return albuns.map((album) => ({ slug: album.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const album = buscarAlbum(slug);

  return album
    ? { title: `${album.titulo}, ${album.artista} | SoundProfile` }
    : {};
}

export default async function AlbumPage({ params }: Props) {
  const { slug } = await params;
  const album = buscarAlbum(slug);

  if (!album) notFound();

  // RN01: só usuário autenticado avalia. Troque `true` pela sessão real
  // quando a autenticação existir.
  return <AlbumView album={album} logado={true} />;
}
