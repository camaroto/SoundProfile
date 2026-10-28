import { buscarImagem } from "@/lib/imagens";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d{1,9}$/.test(id)) return new Response("Não encontrada", { status: 404 });

  const imagem = await buscarImagem(Number(id));
  if (!imagem) return new Response("Não encontrada", { status: 404 });

  return new Response(new Uint8Array(imagem.dados), {
    headers: {
      "Content-Type": imagem.tipo,
      // Cada upload gera um id novo, então a imagem de um id nunca muda.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
