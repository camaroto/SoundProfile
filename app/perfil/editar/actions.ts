"use server";

import { redirect } from "next/navigation";
import { exigirLogin } from "@/lib/sessao";
import { atualizarDadosPerfil } from "@/lib/perfis";
import { validarPerfil, type ErrosPerfil } from "@/lib/validacao";

export type EstadoPerfil = {
  erros: ErrosPerfil;
  valores: { nomeExibicao: string; localizacao: string; biografia: string };
  erroGeral?: string;
};

function texto(formData: FormData, campo: string) {
  return String(formData.get(campo) ?? "").replace(/\r\n/g, "\n").trim();
}

// Aba "Perfil": nome de exibição, localização e biografia.
// Foto, banner, moldura e balão ficam na aba "Personalização".
export async function salvarPerfil(_anterior: EstadoPerfil, formData: FormData): Promise<EstadoPerfil> {
  const usuario = await exigirLogin();

  const valores = {
    nomeExibicao: texto(formData, "nomeExibicao"),
    localizacao: texto(formData, "localizacao"),
    biografia: texto(formData, "biografia"),
  };

  const erros = validarPerfil(valores);
  if (Object.keys(erros).length > 0) return { erros, valores };

  try {
    await atualizarDadosPerfil(usuario.idUsuario, {
      nomeExibicao: valores.nomeExibicao || null,
      localizacao: valores.localizacao || null,
      biografia: valores.biografia,
    });
  } catch (erro) {
    console.error("Falha ao salvar o perfil:", erro);
    return { erros: {}, valores, erroGeral: "Não foi possível salvar o perfil. Tente novamente." };
  }

  redirect(`/perfil/${usuario.username}`);
}
