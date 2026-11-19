
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { api, ApiError } from "@/lib/api";
import { obterTokenSessao } from "@/lib/sessao";

type ResultadoImportacao = {
  musicas: number;
  artistas: number;
  albuns: number;
};

export async function importarMusicasSpotify(
  formData: FormData
): Promise<void> {
  const q = String(formData.get("q") ?? "")
    .trim()
    .slice(0, 80);

  if (!q) {
    redirect("/buscar");
  }

  const token = await obterTokenSessao();

  if (!token) {
    redirect("/login");
  }

  let resultado: ResultadoImportacao;

  try {
    resultado = await api<ResultadoImportacao>(
      `/api/spotify/import?q=${encodeURIComponent(q)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (erro) {
    const mensagem =
      erro instanceof ApiError
        ? erro.message
        : "Não foi possível importar as músicas.";

    redirect(
      `/buscar?q=${encodeURIComponent(q)}&erro=${encodeURIComponent(mensagem)}`
    );
  }

  revalidatePath("/", "page");
  revalidatePath("/buscar", "page");
  revalidatePath("/musica", "page");

  redirect(
    `/buscar?q=${encodeURIComponent(q)}&importadas=${resultado.musicas}`
  );
}