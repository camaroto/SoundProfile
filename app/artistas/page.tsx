import type { Metadata } from "next";
import { Container } from "@/app/components/ui";
import CabecalhoMusicas from "@/app/components/cabecalho-musicas";
import ListaCompleta from "@/app/musica/lista-completa";

export const metadata: Metadata = {
  title: "Artistas | SoundProfile",
  description: "Explore artistas e veja as avaliações da comunidade.",
};

type Props = { searchParams: Promise<{ ordem?: string; pagina?: string }> };

export default async function ArtistasPage({ searchParams }: Props) {
  const sp = await searchParams;
  const ordem = sp.ordem === "melhores" ? "melhores" : "recentes";
  const pagina = Math.max(1, Number(sp.pagina) || 1);

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <Container className="py-10">
        <CabecalhoMusicas ativa="artista" />
        <ListaCompleta tipo="artista" base="/artistas" ordem={ordem} pagina={pagina} />
      </Container>
    </main>
  );
}
