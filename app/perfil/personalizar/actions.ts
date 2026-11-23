"use server";

import { redirect } from "next/navigation";
import { exigirLogin } from "@/lib/sessao";
import { atualizarPersonalizacao, type MudancaImagem } from "@/lib/perfis";
import { ImagemInvalidaError, processarImagem } from "@/lib/imagens";
import { lerBalao, lerMoldura } from "@/lib/molduras";

const LIMITE_BYTES = 2 * 1024 * 1024; // 2 MB por imagem

export type EstadoPersonalizacao = {
  erros: { avatar?: string; banner?: string };
  erroGeral?: string;
};

// undefined = não mexer, null = remover, Buffer = nova imagem.
async function lerImagem(formData: FormData, campo: "avatar" | "banner", rotulo: string): Promise<MudancaImagem> {
  if (formData.get(`remover_${campo}`) === "on") return null;

  const arquivo = formData.get(campo);
  if (!(arquivo instanceof File) || arquivo.size === 0) return undefined;

  if (arquivo.size > LIMITE_BYTES) {
    throw new ImagemInvalidaError(`${rotulo} muito grande. O limite é 2 MB.`);
  }
  return processarImagem(arquivo, campo, { animada: true }); // o perfil aceita GIF animado
}

// Aba "Personalização": foto de perfil, banner, moldura e balão de fala.
export async function salvarPersonalizacao(
  _anterior: EstadoPersonalizacao,
  formData: FormData,
): Promise<EstadoPersonalizacao> {
  const usuario = await exigirLogin();

  const erros: EstadoPersonalizacao["erros"] = {};
  let avatar: MudancaImagem;
  let banner: MudancaImagem;
  for (const campo of ["avatar", "banner"] as const) {
    try {
      const imagem = await lerImagem(formData, campo, campo === "avatar" ? "Foto" : "Banner");
      if (campo === "avatar") avatar = imagem;
      else banner = imagem;
    } catch (erro) {
      if (erro instanceof ImagemInvalidaError) erros[campo] = erro.message;
      else throw erro;
    }
  }
  if (Object.keys(erros).length > 0) return { erros };

  try {
    await atualizarPersonalizacao(usuario.idUsuario, {
      avatar,
      banner,
      // Só ids da lista permitida são gravados; qualquer outro valor vira "sem moldura".
      moldura: lerMoldura(formData.get("moldura")),
      balao: lerBalao(formData.get("balao")),
    });
  } catch (erro) {
    console.error("Falha ao salvar a personalização:", erro);
    return { erros: {}, erroGeral: "Não foi possível salvar. Tente novamente." };
  }

  redirect(`/perfil/${usuario.username}`);
}
