import Link from "next/link";
import { exigirLogin } from "@/lib/sessao";
import { listarNotificacoes } from "@/lib/notificacoes";
import { listarConversas } from "@/lib/mensagens";
import ShellSocial from "@/app/components/social/shell";
import Avatar from "@/app/components/social/avatar";
import BotaoSubmit from "@/app/components/social/botao-submit";
import { AcoesSeguir, botaoSecundario } from "@/app/components/social/acoes-seguir";
import { EstadoVazio } from "@/app/components/ui";
import { formatarDataHora } from "@/lib/formatar-tempo";
import { marcarNotificacoesLidasAction } from "../actions";

export default async function NotificacoesPage() {
  const eu = await exigirLogin();
  const [avisos, conversas] = await Promise.all([listarNotificacoes(eu.idUsuario), listarConversas(eu.idUsuario)]);
  const comMensagens = conversas.filter((c) => c.naoLidas > 0);
  const naoLidas = avisos.filter((a) => !a.lida).length;

  return (
    <ShellSocial idUsuario={eu.idUsuario} ativo="notificacoes">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Notificações</h1>
          {naoLidas > 0 && (
            <form action={marcarNotificacoesLidasAction}>
              <BotaoSubmit pendente="Marcando…" className={botaoSecundario}>Marcar todas como lidas</BotaoSubmit>
            </form>
          )}
        </div>

        {comMensagens.length > 0 && (
          <section className="mt-6" aria-labelledby="t-msgs">
            <h2 id="t-msgs" className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/45">Mensagens não lidas</h2>
            <ul className="space-y-2">
              {comMensagens.map((c) => {
                const nome = c.outro.nomeExibicao || c.outro.username;
                return (
                  <li key={c.idConversa}>
                    <Link href={`/social/mensagens/${c.idConversa}`} className="flex items-center gap-3 rounded-xl border border-violet-400/20 bg-violet-500/[0.07] p-3 transition hover:bg-violet-500/15">
                      <Avatar src={c.outro.avatar} nome={nome} className="h-11 w-11" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{nome} enviou {c.naoLidas} {c.naoLidas === 1 ? "mensagem" : "mensagens"}</span>
                        <span className="block truncate text-xs text-white/45">{c.ultimaTexto}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section className="mt-8" aria-labelledby="t-avisos">
          <h2 id="t-avisos" className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/45">Novos seguidores</h2>
          {avisos.length === 0 ? (
            <EstadoVazio titulo="Nenhuma notificação" texto="Quando alguém começar a seguir você, o aviso aparece aqui." />
          ) : (
            <ul className="space-y-2">
              {avisos.map((a) => {
                const nome = a.nomeExibicao || a.username;
                return (
                  <li key={a.idNotificacao} className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${a.lida ? "border-white/[0.08] bg-white/[0.02]" : "border-violet-400/20 bg-violet-500/[0.07]"}`}>
                    <Link href={`/perfil/${a.username}`} className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar src={a.avatar} nome={nome} className="h-11 w-11" />
                      <span className="min-w-0">
                        <span className="block text-sm"><strong className="font-semibold">{nome}</strong> começou a seguir você.</span>
                        <time dateTime={a.criadaEm.toISOString()} className="text-xs text-white/40">{formatarDataHora(a.criadaEm)}</time>
                      </span>
                    </Link>
                    <AcoesSeguir seguindo={a.jaSigo} meSegue idUsuario={a.idOrigem} nome={nome} />
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </ShellSocial>
  );
}
