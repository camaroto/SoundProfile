import type { Metadata } from "next";
import Link from "next/link";
import { avaliacoesRecentes, listarMembros } from "@/lib/comunidade";
import { DiscoRating } from "@/app/components/disco-rating";
import { Capa, card, Container, EstadoVazio, formatarData, linkItem, TituloSecao } from "@/app/components/ui";

export const metadata: Metadata = {
  title: "Membros | SoundProfile",
  description: "Conheça as pessoas da comunidade SoundProfile.",
};

type Props = { searchParams: Promise<{ q?: string }> };

export default async function MembrosPage({ searchParams }: Props) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 60);
  const [ativos, novos, recentes] = await Promise.all([
    q ? Promise.resolve([]) : listarMembros({ ordem: "ativos", limite: 4 }),
    listarMembros({ q, ordem: "recentes", limite: 24 }),
    q ? Promise.resolve([]) : avaliacoesRecentes(6),
  ]);

  return (
    <main className="min-h-screen bg-[#09090b] text-white">
      <Container className="py-10">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Membros</h1>

        <form role="search" className="mt-6 flex max-w-xl gap-2">
          <label htmlFor="q" className="sr-only">Buscar membros</label>
          <input id="q" name="q" type="search" defaultValue={q} placeholder="Buscar por nome ou usuário..." className="min-w-0 flex-1 rounded-lg border border-white/10 bg-neutral-800 p-3 text-white outline-none placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30" />
          <button type="submit" className="rounded-lg bg-violet-600 px-5 text-sm font-semibold transition hover:bg-violet-500">Buscar</button>
        </form>

        {ativos.some((m) => m.avaliacoes > 0) && (
          <section className="mt-12">
            <TituloSecao titulo="Mais ativos" descricao="Quem mais avaliou no SoundProfile." />
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {ativos.filter((m) => m.avaliacoes > 0).map((m) => (
                <li key={m.idUsuario}>
                  <Link href={`/perfil/${m.username}`} className={`${card} block p-4 text-center transition hover:-translate-y-1 hover:border-violet-400/25`}>
                    <Capa src={m.avatar} nome={m.nomeExibicao || m.username} alt="" className="mx-auto h-20 w-20 rounded-full" />
                    <p className="mt-3 truncate font-medium">{m.nomeExibicao || m.username}</p>
                    <p className="truncate text-xs text-white/40">{m.avaliacoes} avaliaç{m.avaliacoes === 1 ? "ão" : "ões"}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-12">
          <TituloSecao titulo={q ? `Resultados para “${q}”` : "Membros recentes"} />
          {novos.length === 0 ? (
            <EstadoVazio titulo={q ? "Nenhum membro encontrado" : "Ainda não há membros"} />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {novos.map((m) => (
                <li key={m.idUsuario}>
                  <Link href={`/perfil/${m.username}`} className={`${card} flex items-center gap-3 p-4 transition hover:border-violet-400/25 hover:bg-white/[0.045]`}>
                    <Capa src={m.avatar} nome={m.nomeExibicao || m.username} alt="" className="h-12 w-12 shrink-0 rounded-full" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{m.nomeExibicao || m.username}</p>
                      <p className="truncate text-sm text-white/40">@{m.username}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {recentes.length > 0 && (
          <section className="mt-12">
            <TituloSecao titulo="Avaliações recentes" />
            <ul className="grid gap-3 md:grid-cols-2">
              {recentes.map((r) => (
                <li key={r.idAvaliacao} className={`${card} flex items-center gap-4 p-4`}>
                  <Link href={linkItem(r.tipo, r.slug)} className="shrink-0">
                    <Capa src={r.imagem} nome={r.titulo} alt={`Capa de ${r.titulo}`} className={`h-14 w-14 ${r.tipo === "artista" ? "rounded-full" : "rounded-lg"}`} />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={linkItem(r.tipo, r.slug)} className="block truncate text-sm font-medium hover:text-violet-300">{r.titulo}</Link>
                    <p className="truncate text-xs text-white/40"><Link href={`/perfil/${r.username}`} className="hover:text-violet-300">@{r.username}</Link> · {formatarData(r.data)}</p>
                    <div className="mt-1"><DiscoRating nota={r.nota} tamanho={14} /></div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </Container>
    </main>
  );
}
