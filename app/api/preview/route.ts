import { api } from "@/lib/api";

// Procura o trecho de 30 s de uma música na API (que consulta o Deezer).
// A resposta é sempre {"url": "..."} ou {"url": null}; qualquer falha vira "sem prévia".
export async function GET(req: Request) {
  const parametros = new URL(req.url).searchParams;
  const titulo = (parametros.get("titulo") ?? "").trim().slice(0, 200);
  const artista = (parametros.get("artista") ?? "").trim().slice(0, 200);
  if (!titulo || !artista) return Response.json({ url: null }, { status: 400 });

  try {
    const dados = await api<{ url: string | null }>(`/api/preview?${new URLSearchParams({ titulo, artista })}`);
    return Response.json(dados, { headers: { "Cache-Control": "private, max-age=1500" } });
  } catch {
    return Response.json({ url: null });
  }
}
