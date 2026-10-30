import Link from "next/link";
import Avatar from "./avatar";
import { IconeBusca, IconeMais } from "./icones";
import { formatarCurto } from "@/lib/formatar-tempo";
import type { ResumoConversa } from "@/lib/mensagens";

// Lista lateral de conversas anteriores, com busca e indicador de não lidas.
export default function ListaConversas({ conversas, ativa, q }: { conversas: ResumoConversa[]; ativa?: number; q?: string }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-white/45">Mensagens diretas</h2>
        <Link
          href="/social/mensagens/nova"
          aria-label="Iniciar nova conversa"
          className="rounded-md p-1 text-white/55 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          <IconeMais className="h-4 w-4" />
        </Link>
      </div>

      <form action="/social/mensagens" role="search" className="px-3 pb-2">
        <label htmlFor="busca-conversas" className="sr-only">Pesquisar conversas</label>
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 focus-within:border-violet-500">
          <IconeBusca className="h-4 w-4 shrink-0 text-white/40" />
          <input
            id="busca-conversas"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Buscar conversa"
            className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-white/35"
          />
        </div>
      </form>

      {conversas.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm leading-6 text-white/40">
          {q ? "Nenhuma conversa encontrada." : "Você ainda não tem conversas. Abra o perfil de alguém e toque em Enviar mensagem."}
        </p>
      ) : (
        <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
          {conversas.map((c) => {
            const nome = c.outro.nomeExibicao || c.outro.username;
            const naoLida = c.naoLidas > 0;
            return (
              <li key={c.idConversa}>
                <Link
                  href={`/social/mensagens/${c.idConversa}`}
                  aria-current={ativa === c.idConversa ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-2 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                    ativa === c.idConversa ? "bg-violet-500/20" : "hover:bg-white/[0.06]"
                  }`}
                >
                  <Avatar src={c.outro.avatar} nome={nome} className="h-10 w-10" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className={`truncate text-sm ${naoLida ? "font-semibold text-white" : "font-medium text-white/85"}`}>{nome}</span>
                      <time dateTime={c.ultimaEm.toISOString()} className="shrink-0 text-[11px] text-white/35">{formatarCurto(c.ultimaEm)}</time>
                    </span>
                    <span className={`block truncate text-xs ${naoLida ? "text-white/80" : "text-white/40"}`}>
                      {c.ultimaPropria ? "Você: " : ""}{c.ultimaTexto}
                    </span>
                  </span>
                  {naoLida && (
                    <span className="min-w-[20px] shrink-0 rounded-full bg-violet-500 px-1.5 text-center text-[11px] font-bold leading-5">
                      <span className="sr-only">{c.naoLidas} não lidas</span>
                      <span aria-hidden="true">{c.naoLidas > 99 ? "99+" : c.naoLidas}</span>
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
