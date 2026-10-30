import { deixarDeSeguirAction, iniciarConversaAction, seguirAction } from "@/app/social/actions";
import BotaoSubmit from "./botao-submit";
import { IconeChat } from "./icones";

const foco = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300";
export const botaoPrimario = `rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 ${foco}`;
export const botaoSecundario = `rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-white ${foco}`;

function Campo({ idUsuario }: { idUsuario: number }) {
  return <input type="hidden" name="idUsuario" value={idUsuario} />;
}

// Botão "Enviar mensagem": abre (ou cria) a conversa privada com o usuário.
export function BotaoMensagem({ idUsuario, compacto = false }: { idUsuario: number; compacto?: boolean }) {
  return (
    <form action={iniciarConversaAction}>
      <Campo idUsuario={idUsuario} />
      <BotaoSubmit
        pendente="Abrindo…"
        className={`inline-flex items-center gap-2 ${compacto ? "rounded-lg border border-white/10 p-2 text-white/70 transition hover:bg-white/10 hover:text-white" : botaoSecundario} ${foco}`}
      >
        <IconeChat className="h-4 w-4" />
        {compacto ? <span className="sr-only">Enviar mensagem</span> : "Enviar mensagem"}
      </BotaoSubmit>
    </form>
  );
}

// Seguir não precisa de aprovação. "Seguindo" abre um menu para deixar de seguir.
export function AcoesSeguir({ seguindo, meSegue, idUsuario, nome }: { seguindo: boolean; meSegue: boolean; idUsuario: number; nome: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {seguindo ? (
        <details className="relative">
          <summary className={`inline-flex cursor-pointer list-none items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20 ${foco}`}>
            <span aria-hidden="true">✓</span> Seguindo
          </summary>
          <div className="absolute left-0 z-30 mt-2 w-64 rounded-xl border border-white/10 bg-[#14121c] p-3 shadow-2xl shadow-black/60">
            <p className="text-sm text-white/70">Deixar de seguir {nome}?</p>
            <form action={deixarDeSeguirAction} className="mt-3">
              <Campo idUsuario={idUsuario} />
              <BotaoSubmit pendente="Aguarde…" className="w-full rounded-lg bg-red-500/90 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-500">
                Deixar de seguir
              </BotaoSubmit>
            </form>
          </div>
        </details>
      ) : (
        <form action={seguirAction}>
          <Campo idUsuario={idUsuario} />
          <BotaoSubmit pendente="Seguindo…" className={botaoPrimario}>{meSegue ? "Seguir de volta" : "Seguir"}</BotaoSubmit>
        </form>
      )}
      {meSegue && <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/55">Segue você</span>}
    </div>
  );
}
