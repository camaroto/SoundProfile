"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { obterUsuarioLogado } from "@/lib/sessao";
import { deixarDeSeguir, seguir, SeguirInvalidoError } from "@/lib/seguidores";
import {
  enviarMensagem, limparConversa, marcarComoLida, MensagemInvalidaError, obterOuCriarConversa,
} from "@/lib/mensagens";
import { marcarTodasLidas } from "@/lib/notificacoes";
import type { ResultadoEnvio } from "@/lib/mensagens-tipos";

// Toda ação confere o login no servidor (RN01) e usa SEMPRE o id da sessão como
// "eu": o formulário só informa o outro usuário, nunca quem está agindo.
async function exigirUsuario() {
  const usuario = await obterUsuarioLogado();
  if (!usuario) redirect("/login");
  return usuario;
}

function lerId(formData: FormData, campo: string): number | null {
  const n = Number(formData.get(campo));
  return Number.isInteger(n) && n > 0 && n < 2_147_483_647 ? n : null;
}

// Atualiza tudo que mostra o estado de "seguindo" (perfis, Social, menu).
function atualizarTudo() {
  revalidatePath("/", "layout");
}

export async function seguirAction(formData: FormData): Promise<void> {
  const eu = await exigirUsuario();
  const outro = lerId(formData, "idUsuario");
  if (!outro) return;
  try {
    await seguir(eu.idUsuario, outro);
  } catch (erro) {
    if (!(erro instanceof SeguirInvalidoError)) console.error("Falha ao seguir:", erro);
  }
  atualizarTudo();
}

export async function deixarDeSeguirAction(formData: FormData): Promise<void> {
  const eu = await exigirUsuario();
  const outro = lerId(formData, "idUsuario");
  if (!outro) return;
  await deixarDeSeguir(eu.idUsuario, outro);
  atualizarTudo();
}

export async function iniciarConversaAction(formData: FormData): Promise<void> {
  const eu = await exigirUsuario();
  const outro = lerId(formData, "idUsuario");
  if (!outro) return;

  let idConversa: number;
  try {
    idConversa = await obterOuCriarConversa(eu.idUsuario, outro);
  } catch (erro) {
    if (!(erro instanceof MensagemInvalidaError)) console.error("Falha ao abrir conversa:", erro);
    redirect("/social/mensagens");
  }
  redirect(`/social/mensagens/${idConversa}`);
}

// Chamada pelo chat aberto. Não faz revalidatePath de propósito: a tela de conversa
// atualiza sozinha e não precisa recarregar a cada mensagem.
export async function enviarMensagemAction(idConversa: number, texto: string): Promise<ResultadoEnvio> {
  const eu = await exigirUsuario();
  if (!Number.isInteger(idConversa) || idConversa <= 0 || typeof texto !== "string") {
    return { ok: false, erro: "Mensagem inválida." };
  }
  try {
    const mensagem = await enviarMensagem(eu.idUsuario, idConversa, texto);
    return { ok: true, mensagem };
  } catch (erro) {
    if (erro instanceof MensagemInvalidaError) return { ok: false, erro: erro.message };
    console.error("Falha ao enviar mensagem:", erro);
    return { ok: false, erro: "Não foi possível enviar. Tente novamente." };
  }
}

export async function marcarLidaAction(idConversa: number): Promise<void> {
  const eu = await exigirUsuario();
  if (!Number.isInteger(idConversa) || idConversa <= 0) return;
  await marcarComoLida(eu.idUsuario, idConversa);
}

export async function limparConversaAction(formData: FormData): Promise<void> {
  const eu = await exigirUsuario();
  const idConversa = lerId(formData, "idConversa");
  if (!idConversa) return;
  await limparConversa(eu.idUsuario, idConversa);
  redirect("/social/mensagens");
}

export async function marcarNotificacoesLidasAction(): Promise<void> {
  const eu = await exigirUsuario();
  await marcarTodasLidas(eu.idUsuario);
  revalidatePath("/social/notificacoes");
}
