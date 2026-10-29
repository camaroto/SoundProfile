import Link from "next/link";
import { DiscoRating } from "@/app/components/disco-rating";
import { formatarNota } from "@/app/components/disco-rating/formatar";
import { card, EstadoVazio, formatarData } from "@/app/components/ui";
import { curtirAction, favoritarAction, removerAvaliacaoAction } from "@/app/avaliacoes/actions";
import type { AvaliacaoPublica, EstatisticasItem } from "@/lib/avaliacoes";
import type { TipoItem } from "@/lib/constantes";
import PainelAvaliacao from "./painel";

export function BotaoFavorito({ tipo, idItem, favorito }: { tipo: TipoItem; idItem: number; favorito: boolean }) {
  return (
    <form action={favoritarAction}>
      <input type="hidden" name="tipo" value={tipo} />
      <input type="hidden" name="idItem" value={idItem} />
      <button
        type="submit"
        aria-pressed={favorito}
        className={`rounded-lg border px-4 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
          favorito
            ? "border-violet-400/40 bg-violet-500/15 text-violet-200"
            : "border-white/10 bg-white/5 text-white/80 hover:border-violet-500/50 hover:bg-white/10"
        }`}
      >
        {favorito ? "♥ Nos favoritos" : "♡ Favoritar"}
      </button>
    </form>
  );
}

// Resumo: média da comunidade (só com avaliações suficientes), a nota do usuário e a distribuição.
export function ResumoNotas({ stats, minhaNota }: { stats: EstatisticasItem; minhaNota: number | null }) {
  const maior = Math.max(1, ...stats.distribuicao.map((d) => d.qtd));
  return (
    <div>
      <h2 className="mb-4 font-semibold">Avaliações</h2>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/[0.04] p-3">
          <p className="text-xs text-white/40">Média da comunidade</p>
          {stats.media !== null ? (
            <p className="mt-1 text-2xl font-semibold tabular-nums text-amber-200">{formatarNota(stats.media)}</p>
          ) : (
            <p className="mt-1 text-xs leading-5 text-white/45">
              Aparece com {stats.minimo} avaliações ({stats.total} até agora)
            </p>
          )}
        </div>
        <div className="rounded-xl bg-white/[0.04] p-3">
          <p className="text-xs text-white/40">Sua nota</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-violet-300">
            {minhaNota !== null ? formatarNota(minhaNota) : "–"}
          </p>
        </div>
      </div>

      <ul aria-label="Distribuição das notas" className="mt-5 space-y-1.5">
        {[...stats.distribuicao].reverse().map((d) => (
          <li key={d.nota} className="flex items-center gap-2 text-xs">
            <span className="w-7 text-right tabular-nums text-white/45">{formatarNota(d.nota, d.nota % 1 ? 1 : 0)}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-400" style={{ width: `${(d.qtd / maior) * 100}%` }} />
            </div>
            <span className="w-6 text-right tabular-nums text-white/30">{d.qtd}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ColunaAvaliacao({
  tipo, idItem, nomeItem, stats, minha, favorito, usuarioId,
}: {
  tipo: TipoItem;
  idItem: number;
  nomeItem: string;
  stats: EstatisticasItem;
  minha: { idAvaliacao: number; nota: number; comentario: string } | null;
  favorito: boolean;
  usuarioId: number | null;
}) {
  return (
    <aside className="space-y-5">
      <section id="sua-avaliacao" className={`${card} scroll-mt-24 p-5`}>
        {/* A chave refaz o formulário quando a avaliação passa a existir ou deixa de existir. */}
        <PainelAvaliacao key={minha ? "com" : "sem"} tipo={tipo} idItem={idItem} logado={usuarioId !== null} minha={minha} nomeItem={nomeItem} />
      </section>
      <section className={`${card} p-5`}>
        <ResumoNotas stats={stats} minhaNota={minha?.nota ?? null} />
      </section>
      {usuarioId !== null && <BotaoFavorito tipo={tipo} idItem={idItem} favorito={favorito} />}
    </aside>
  );
}

export function SecaoAvaliacoes({
  tipo, idItem, avaliacoes, usuarioId, ehAdmin,
}: {
  tipo: TipoItem;
  idItem: number;
  avaliacoes: AvaliacaoPublica[];
  usuarioId: number | null;
  ehAdmin: boolean;
}) {
  if (avaliacoes.length === 0) {
    return <EstadoVazio titulo="Ninguém avaliou ainda" texto="Seja a primeira pessoa a deixar uma nota." />;
  }

  return (
    <div className="space-y-3">
      {avaliacoes.map((av) => {
        const minha = av.idUsuario === usuarioId;
        const nome = av.nomeExibicao || av.username;
        return (
          <article key={av.idAvaliacao} className={`${card} p-5 ${minha ? "border-violet-400/30" : ""}`}>
            <header className="flex items-center gap-3">
              <Link href={`/perfil/${av.username}`} className="shrink-0">
                {av.avatar ? (
                  <img src={av.avatar} alt="" className="h-11 w-11 rounded-full border border-violet-500/30 object-cover" />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-600 font-bold">{nome[0].toUpperCase()}</span>
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/perfil/${av.username}`} className="block truncate text-sm font-semibold hover:text-violet-300">
                  {minha ? "Você" : nome}
                  <span className="ml-2 font-normal text-white/40">@{av.username}</span>
                </Link>
                <p className="text-xs text-white/35">{formatarData(av.data)}</p>
              </div>
              <DiscoRating nota={av.nota} tamanho={16} />
            </header>

            {av.comentario && <p className="mt-4 max-w-prose whitespace-pre-line text-sm leading-6 text-white/70">{av.comentario}</p>}

            <div className="mt-4 flex items-center gap-2">
              {!minha && (
                <form action={curtirAction}>
                  <input type="hidden" name="tipo" value={tipo} />
                  <input type="hidden" name="idItem" value={idItem} />
                  <input type="hidden" name="idAvaliacao" value={av.idAvaliacao} />
                  <button
                    type="submit"
                    aria-pressed={av.curtiu}
                    className={`rounded-lg border px-3 py-1.5 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                      av.curtiu ? "border-violet-400/40 bg-violet-500/15 text-violet-200" : "border-white/10 text-white/50 hover:border-violet-400/30 hover:text-white"
                    }`}
                  >
                    {av.curtiu ? "Curtido" : "Curtir"} · {av.curtidas}
                  </button>
                </form>
              )}
              {minha && av.curtidas > 0 && <span className="text-xs text-white/40">{av.curtidas} curtida{av.curtidas === 1 ? "" : "s"}</span>}

              {ehAdmin && !minha && (
                <form action={removerAvaliacaoAction}>
                  <input type="hidden" name="tipo" value={tipo} />
                  <input type="hidden" name="idItem" value={idItem} />
                  <input type="hidden" name="idAvaliacao" value={av.idAvaliacao} />
                  <button type="submit" className="rounded-lg px-3 py-1.5 text-xs text-red-300/80 transition hover:bg-red-500/10">
                    Remover (moderação)
                  </button>
                </form>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
