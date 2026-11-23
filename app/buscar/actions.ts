"use server";

import { redirect } from "next/navigation";

import { api, ApiError } from "@/lib/api";
import { obterTokenSessao } from "@/lib/sessao";

type MusicaImportada = { slug: string; titulo: string | null };

// Botão "Avaliar" de uma música do Spotify: traz só esta música (com álbum e artista) para o
// catálogo e leva a pessoa para a página dela, já na caixa de avaliação.
export async function avaliarMusicaSpotify(formData: FormData): Promise<void> {
  const spotifyId = String(formData.get("spotifyId") ?? "");
  const q = String(formData.get("q") ?? "").trim().slice(0, 80);

  // Os ids do Spotify têm sempre 22 letras e números.
  if (!/^[A-Za-z0-9]{22}$/.test(spotifyId)) redirect(q ? `/buscar?${new URLSearchParams({ q })}` : "/buscar");

  const token = await obterTokenSessao();
  if (!token) redirect("/login");

  let importada: MusicaImportada;
  try {
    importada = await api<MusicaImportada>(`/api/spotify/musicas/${spotifyId}/importar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (erro) {
    const mensagem = erro instanceof ApiError ? erro.message : "Não foi possível abrir esta música.";
    redirect(`/buscar?${new URLSearchParams({ q, erro: mensagem })}`);
  }

  redirect(`/musica/${importada.slug}#sua-avaliacao`);
}
