"use server";

import { redirect } from "next/navigation";
import { exigirLogin } from "@/lib/sessao";
import { atualizarPerfil, type MudancaImagem } from "@/lib/perfis";
import { ImagemInvalidaError, processarImagem } from "@/lib/imagens";
import { validarPerfil, type ErrosPerfil } from "@/lib/validacao";

const LIMITE_BYTES = 2 * 1024 * 1024; // 2 MB por imagem

export type EstadoPerfil = {
  erros: ErrosPerfil & { avatar?: string; banner?: string };
  valores: { nomeExibicao: string; localizacao: string; biografia: string };
  erroGeral?: string;
};

function texto(formData: FormData, campo: string) {
  return String(formData.get(campo) ?? "").replace(/\r\n/g, "\n").trim();
}

// undefined = não mexer, null = remover, Buffer = nova imagem.
async function lerImagem(
  formData: FormData,
  campo: "avatar" | "banner",
  rotulo: string,
): Promise<MudancaImagem> {
  if (formData.get(`remover_${campo}`) === "on") return null;

  const arquivo = formData.get(campo);
  if (!(arquivo instanceof File) || arquivo.size === 0) return undefined;

  if (arquivo.size > LIMITE_BYTES) {
    throw new ImagemInvalidaError(`${rotulo} muito grande. O limite é 2 MB.`);
  }
  return processarImagem(arquivo, campo, { animada: true }); // o perfil aceita GIF animado
}

export async function salvarPerfil(
  _anterior: EstadoPerfil,
  formData: FormData,
): Promise<EstadoPerfil> {
  const usuario = await exigirLogin();

  const valores = {
    nomeExibicao: texto(formData, "nomeExibicao"),
    localizacao: texto(formData, "localizacao"),
    biografia: texto(formData, "biografia"),
  };

  const erros: EstadoPerfil["erros"] = validarPerfil(valores);

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

  if (Object.keys(erros).length > 0) return { erros, valores };

  try {
    await atualizarPerfil(usuario.idUsuario, {
      nomeExibicao: valores.nomeExibicao || null,
      localizacao: valores.localizacao || null,
      biografia: valores.biografia,
      avatar,
      banner,
    });
  } catch (erro) {
    console.error("Falha ao salvar o perfil:", erro);
    return { erros: {}, valores, erroGeral: "Não foi possível salvar o perfil. Tente novamente." };
  }

  redirect(`/perfil/${usuario.username}`);
}
