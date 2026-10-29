"use server";

import { revalidatePath } from "next/cache";
import { exigirAdmin } from "@/lib/sessao";
import { criarAlbum, criarArtista, criarMusica, CatalogoError, excluirItem } from "@/lib/catalogo-admin";
import { ImagemInvalidaError, lerImagemDoForm } from "@/lib/imagens";
import { ehTipo } from "@/lib/constantes";

export type EstadoAdmin = { ok?: string; erro?: string };

const texto = (fd: FormData, campo: string) => String(fd.get(campo) ?? "").replace(/\r\n/g, "\n").trim();
const inteiro = (fd: FormData, campo: string) => {
  const v = texto(fd, campo);
  return v === "" ? null : Number(v);
};

function atualizar() {
  for (const caminho of ["/musica", "/generos", "/admin", "/"]) revalidatePath(caminho);
  revalidatePath("/generos/[slug]", "page");
}

// Toda ação confere o administrador de novo no servidor: esconder o botão não basta.
async function executar(trabalho: () => Promise<string>): Promise<EstadoAdmin> {
  try {
    const mensagem = await trabalho();
    atualizar();
    return { ok: mensagem };
  } catch (erro) {
    if (erro instanceof ImagemInvalidaError || erro instanceof CatalogoError) return { erro: erro.message };
    const e = erro as { code?: string };
    if (e.code === "23503") return { erro: "Um dos itens escolhidos não existe mais." };
    console.error("Falha na área do administrador:", erro);
    return { erro: "Não foi possível salvar. Tente novamente." };
  }
}

export async function criarArtistaAction(_: EstadoAdmin, fd: FormData): Promise<EstadoAdmin> {
  await exigirAdmin();
  return executar(async () => {
    const nome = texto(fd, "nome");
    const biografia = texto(fd, "biografia");
    if (!nome || nome.length > 100) throw new CatalogoError("Informe o nome do artista (até 100 caracteres).");
    if (biografia.length > 1500) throw new CatalogoError("A biografia pode ter no máximo 1500 caracteres.");
    const generos = fd.getAll("generos").map(Number).filter((n) => Number.isInteger(n) && n > 0);
    const imagem = await lerImagemDoForm(fd, "imagem", "avatar", "Foto");
    await criarArtista({ nome, biografia, imagem, generos });
    return `Artista “${nome}” cadastrado.`;
  });
}

export async function criarAlbumAction(_: EstadoAdmin, fd: FormData): Promise<EstadoAdmin> {
  await exigirAdmin();
  return executar(async () => {
    const titulo = texto(fd, "titulo");
    const idArtista = inteiro(fd, "idArtista");
    const ano = inteiro(fd, "ano");
    if (!titulo || titulo.length > 150) throw new CatalogoError("Informe o título do álbum (até 150 caracteres).");
    if (!idArtista) throw new CatalogoError("Escolha o artista.");
    if (ano !== null && (!Number.isInteger(ano) || ano < 1900 || ano > 2100)) throw new CatalogoError("Ano inválido.");
    const capa = await lerImagemDoForm(fd, "capa", "capa", "Capa");
    await criarAlbum({ titulo, idArtista, ano, capa });
    return `Álbum “${titulo}” cadastrado.`;
  });
}

export async function criarMusicaAction(_: EstadoAdmin, fd: FormData): Promise<EstadoAdmin> {
  await exigirAdmin();
  return executar(async () => {
    const titulo = texto(fd, "titulo");
    const idArtista = inteiro(fd, "idArtista");
    const idAlbum = inteiro(fd, "idAlbum");
    const faixa = inteiro(fd, "faixa");
    if (!titulo || titulo.length > 150) throw new CatalogoError("Informe o título da música (até 150 caracteres).");
    if (!idArtista) throw new CatalogoError("Escolha o artista.");
    if (faixa !== null && (!Number.isInteger(faixa) || faixa < 1 || faixa > 500)) throw new CatalogoError("Número da faixa inválido.");
    await criarMusica({ titulo, idArtista, idAlbum, faixa });
    return `Música “${titulo}” cadastrada.`;
  });
}

export async function excluirItemAction(fd: FormData): Promise<void> {
  await exigirAdmin();
  const tipo = fd.get("tipo");
  const id = Number(fd.get("id"));
  if (!ehTipo(tipo) || !Number.isInteger(id) || id <= 0) return;
  await excluirItem(tipo, id);
  atualizar();
}
