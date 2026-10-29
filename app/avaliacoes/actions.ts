"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { obterUsuarioLogado } from "@/lib/sessao";
import { query } from "@/lib/db";
import { COLUNA, ehTipo, ROTA, type TipoItem } from "@/lib/constantes";
import {
  alternarCurtida, alternarFavorito, AvaliacaoInvalidaError, removerAvaliacao, salvarAvaliacao, validarNota,
} from "@/lib/avaliacoes";

export type EstadoAvaliacao = { erro?: string; ok?: boolean };

const TABELA: Record<TipoItem, string> = { artista: "Artista", album: "Album", musica: "Musica" };

// Atualiza a página do item depois de uma ação. O endereço vem do banco, não do formulário.
async function atualizarPagina(tipo: TipoItem, idItem: number) {
  const r = await query<{ slug: string }>(`SELECT slug FROM ${TABELA[tipo]} WHERE ${COLUNA[tipo]} = $1`, [idItem]);
  if (r[0]) revalidatePath(`/${ROTA[tipo]}/${r[0].slug}`);
  revalidatePath("/perfil/[username]", "page");
}

function lerItem(formData: FormData): { tipo: TipoItem; idItem: number } | null {
  const tipo = formData.get("tipo");
  const idItem = Number(formData.get("idItem"));
  return ehTipo(tipo) && Number.isInteger(idItem) && idItem > 0 ? { tipo, idItem } : null;
}

export async function salvarAvaliacaoAction(_anterior: EstadoAvaliacao, formData: FormData): Promise<EstadoAvaliacao> {
  const usuario = await obterUsuarioLogado();
  if (!usuario) redirect("/login"); // RN01

  const item = lerItem(formData);
  if (!item) return { erro: "Item inválido." };

  const comentario = String(formData.get("comentario") ?? "").replace(/\r\n/g, "\n").trim();
  if (comentario.length > 1000) return { erro: "O comentário pode ter no máximo 1000 caracteres." };

  try {
    const nota = validarNota(formData.get("nota"));
    await salvarAvaliacao(usuario.idUsuario, item.tipo, item.idItem, nota, comentario);
  } catch (erro) {
    if (erro instanceof AvaliacaoInvalidaError) return { erro: erro.message };
    console.error("Falha ao salvar avaliação:", erro);
    return { erro: "Não foi possível salvar a avaliação. Tente novamente." };
  }

  await atualizarPagina(item.tipo, item.idItem);
  return { ok: true };
}

export async function removerAvaliacaoAction(formData: FormData): Promise<void> {
  const usuario = await obterUsuarioLogado();
  if (!usuario) redirect("/login");

  const item = lerItem(formData);
  const idAvaliacao = Number(formData.get("idAvaliacao"));
  if (!item || !Number.isInteger(idAvaliacao)) return;

  // Dono apaga a própria; admin apaga qualquer uma.
  await removerAvaliacao(idAvaliacao, usuario.idUsuario, usuario.role === "admin");
  await atualizarPagina(item.tipo, item.idItem);
}

export async function curtirAction(formData: FormData): Promise<void> {
  const usuario = await obterUsuarioLogado();
  if (!usuario) redirect("/login");

  const item = lerItem(formData);
  const idAvaliacao = Number(formData.get("idAvaliacao"));
  if (!item || !Number.isInteger(idAvaliacao)) return;

  await alternarCurtida(idAvaliacao, usuario.idUsuario);
  await atualizarPagina(item.tipo, item.idItem);
}

export async function favoritarAction(formData: FormData): Promise<void> {
  const usuario = await obterUsuarioLogado();
  if (!usuario) redirect("/login");

  const item = lerItem(formData);
  if (!item) return;

  await alternarFavorito(usuario.idUsuario, item.tipo, item.idItem);
  await atualizarPagina(item.tipo, item.idItem);
}
