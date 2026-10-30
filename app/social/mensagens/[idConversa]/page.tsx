import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { exigirLogin } from "@/lib/sessao";
import { carregarConversa, listarMensagens, marcarComoLida } from "@/lib/mensagens";
import ShellSocial from "@/app/components/social/shell";
import PainelPerfil from "@/app/components/social/painel-perfil";
import ChatCliente from "./chat";

type Props = { params: Promise<{ idConversa: string }> };

export const metadata: Metadata = { title: "Conversa | SoundProfile" };

export default async function ConversaPage({ params }: Props) {
  const eu = await exigirLogin();
  const { idConversa: bruto } = await params;
  if (!/^\d{1,9}$/.test(bruto)) notFound();
  const idConversa = Number(bruto);

  // Controle de acesso (item 13 dos testes): quem não participa recebe 404,
  // igual a uma conversa que não existe.
  const conversa = await carregarConversa(eu.idUsuario, idConversa);
  if (!conversa) notFound();

  // Abrir a conversa marca tudo como lido. Precisa acontecer antes de a lista lateral ser montada.
  await marcarComoLida(eu.idUsuario, idConversa);
  const { mensagens, temMais } = await listarMensagens(eu.idUsuario, idConversa, { limite: 50 });
  const nome = conversa.outro.nomeExibicao || conversa.outro.username;

  return (
    <ShellSocial idUsuario={eu.idUsuario} ativo="mensagens" conversaAtiva={idConversa} semAbasMobile>
      <ChatCliente
        idConversa={idConversa}
        euId={eu.idUsuario}
        outro={{ idUsuario: conversa.outro.idUsuario, nome, username: conversa.outro.username, avatar: conversa.outro.avatar, ativo: conversa.outro.ativo }}
        iniciais={mensagens}
        temMaisInicial={temMais}
        painel={<PainelPerfil eu={eu.idUsuario} username={conversa.outro.username} />}
      />
    </ShellSocial>
  );
}
