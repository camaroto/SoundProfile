import Link from "next/link";
import { exigirLogin } from "@/lib/sessao";
import ShellSocial from "@/app/components/social/shell";
import { IconeChat } from "@/app/components/social/icones";

type Props = { searchParams: Promise<{ q?: string }> };

// No computador: lista à esquerda e este aviso à direita. No celular: só a lista.
export default async function MensagensPage({ searchParams }: Props) {
  const eu = await exigirLogin();
  const q = ((await searchParams).q ?? "").trim().slice(0, 60);

  return (
    <ShellSocial idUsuario={eu.idUsuario} ativo="mensagens" q={q} menuMobile>
      <div className="flex h-[calc(100dvh-4rem)] flex-col items-center justify-center px-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/15 text-violet-300"><IconeChat className="h-8 w-8" /></span>
        <h1 className="mt-5 text-xl font-semibold">Suas mensagens</h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-white/45">Escolha uma conversa na lista ou comece uma nova para falar de música com outros membros.</p>
        <Link href="/social/mensagens/nova" className="mt-6 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500">Nova conversa</Link>
      </div>
    </ShellSocial>
  );
}
