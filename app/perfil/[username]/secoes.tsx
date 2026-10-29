import Link from "next/link";
import { DiscoRating } from "@/app/components/disco-rating";
import { formatarNota } from "@/app/components/disco-rating/formatar";
import { BarrasHorizontais, GraficoBarras } from "@/app/components/graficos";
import { Capa, card, EstadoVazio, formatarData, linkItem, TituloSecao } from "@/app/components/ui";
import { avaliacoesDoUsuario, favoritosDoUsuario, type AvaliacaoDoUsuario, type ItemRef } from "@/lib/avaliacoes";
import { estatisticasDoUsuario } from "@/lib/estatisticas";
import { PERIODOS, ROTULO, ROTULO_PLURAL, TIPOS, type Periodo } from "@/lib/constantes";

type Base = { idUsuario: number; username: string; nome: string; ehDono: boolean };

export function SeletorPeriodo({ username, aba, periodo }: { username: string; aba: string; periodo: Periodo }) {
  return (
    <nav aria-label="Período" className="mb-6 flex flex-wrap gap-2">
      {PERIODOS.map((p) => (
        <Link
          key={p.valor}
          href={`/perfil/${username}?aba=${aba}&periodo=${p.valor}`}
          aria-current={periodo === p.valor ? "true" : undefined}
          className={`rounded-full border px-4 py-1.5 text-sm transition ${
            periodo === p.valor ? "border-violet-400/50 bg-violet-500/20 text-white" : "border-white/10 text-white/55 hover:border-violet-400/30 hover:text-white"
          }`}
        >
          {p.rotulo}
        </Link>
      ))}
    </nav>
  );
}

function LinhaAvaliacao({ av }: { av: AvaliacaoDoUsuario }) {
  return (
    <li className={`${card} flex gap-4 p-4`}>
      <Link href={linkItem(av.tipo, av.slug)} className="shrink-0">
        <Capa src={av.imagem} nome={av.titulo} alt={`Capa de ${av.titulo}`} className={`h-16 w-16 ${av.tipo === "artista" ? "rounded-full" : "rounded-lg"}`} />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <Link href={linkItem(av.tipo, av.slug)} className="min-w-0 truncate font-medium hover:text-violet-300">{av.titulo}</Link>
          <DiscoRating nota={av.nota} tamanho={16} />
        </div>
        <p className="text-xs text-white/40">
          {ROTULO[av.tipo]}{av.artista && av.tipo !== "artista" ? `, ${av.artista}` : ""} · {formatarData(av.data)}
        </p>
        {av.comentario && <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-6 text-white/65">{av.comentario}</p>}
      </div>
    </li>
  );
}

function GradeItens({ itens }: { itens: ItemRef[] }) {
  return (
    <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {itens.map((i) => (
        <li key={`${i.tipo}-${i.slug}`}>
          <Link href={linkItem(i.tipo, i.slug)} className="group block">
            <Capa src={i.imagem} nome={i.titulo} alt={`Capa de ${i.titulo}`} className={`aspect-square w-full ${i.tipo === "artista" ? "rounded-full" : "rounded-xl"}`} />
            <p className="mt-2 truncate text-xs font-medium group-hover:text-violet-300">{i.titulo}</p>
            <p className="truncate text-[11px] text-white/35">{ROTULO[i.tipo]}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export async function VisaoGeral({ idUsuario, username, nome, ehDono }: Base) {
  const [recentes, favoritos, stats] = await Promise.all([
    avaliacoesDoUsuario(idUsuario, "tudo", { limite: 3 }),
    favoritosDoUsuario(idUsuario, 6),
    estatisticasDoUsuario(idUsuario, "tudo"),
  ]);
  const vazio = recentes.length === 0 && favoritos.length === 0;

  return (
    <div className="space-y-12">
      {vazio && (
        <EstadoVazio
          titulo="Nada por aqui ainda"
          texto={ehDono ? "Quando você avaliar álbuns, artistas e músicas ou favoritar itens, eles aparecem aqui." : `${nome} ainda não avaliou nem favoritou nada.`}
          acao={ehDono ? { href: "/musica", rotulo: "Explorar músicas" } : undefined}
        />
      )}

      {recentes.length > 0 && (
        <section>
          <TituloSecao titulo="Avaliações recentes" acao={{ href: `/perfil/${username}?aba=avaliacoes`, rotulo: "Ver todas" }} />
          <ul className="space-y-3">{recentes.map((a) => <LinhaAvaliacao key={a.idAvaliacao} av={a} />)}</ul>
        </section>
      )}

      {favoritos.length > 0 && (
        <section>
          <TituloSecao titulo="Favoritos" acao={{ href: `/perfil/${username}?aba=rankings`, rotulo: "Ver todos" }} />
          <GradeItens itens={favoritos} />
        </section>
      )}

      {stats.generos.length > 0 && (
        <section>
          <TituloSecao titulo="Gêneros mais avaliados" />
          <div className={`${card} p-5`}>
            <BarrasHorizontais titulo="Gêneros mais avaliados" dados={stats.generos.map((g) => ({ rotulo: g.nome, valor: g.total }))} />
          </div>
        </section>
      )}

      {ehDono && (
        <section className={`${card} p-5`}>
          <h2 className="font-semibold">Mais ouvidos no Spotify</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
            Seus artistas, álbuns e músicas mais escutados aparecem aqui quando a conexão com o Spotify estiver disponível. Essa integração ainda não foi implementada.
          </p>
        </section>
      )}
    </div>
  );
}

export async function SecaoAvaliacoesDoPerfil({ idUsuario, username, nome, ehDono, periodo }: Base & { periodo: Periodo }) {
  const avaliacoes = await avaliacoesDoUsuario(idUsuario, periodo);
  return (
    <section>
      <TituloSecao titulo={ehDono ? "Minhas avaliações" : "Avaliações"} descricao={`${avaliacoes.length} no período`} />
      <SeletorPeriodo username={username} aba="avaliacoes" periodo={periodo} />
      {avaliacoes.length === 0 ? (
        <EstadoVazio
          titulo="Nenhuma avaliação neste período"
          texto={ehDono ? "Avalie álbuns, artistas e músicas para vê-los aqui." : `${nome} não avaliou nada neste período.`}
          acao={ehDono ? { href: "/musica", rotulo: "Explorar músicas" } : undefined}
        />
      ) : (
        <ul className="space-y-3">{avaliacoes.map((a) => <LinhaAvaliacao key={a.idAvaliacao} av={a} />)}</ul>
      )}
    </section>
  );
}

export async function SecaoEstatisticas({ idUsuario, username, periodo }: Base & { periodo: Periodo }) {
  const e = await estatisticasDoUsuario(idUsuario, periodo);
  const rotuloPeriodo = PERIODOS.find((p) => p.valor === periodo)!.rotulo.toLowerCase();

  return (
    <section>
      <TituloSecao titulo="Estatísticas" descricao="Calculadas a partir das avaliações feitas no SoundProfile." />
      <SeletorPeriodo username={username} aba="estatisticas" periodo={periodo} />

      {e.total === 0 ? (
        <EstadoVazio titulo="Sem avaliações neste período" texto="Os gráficos aparecem quando houver avaliações para mostrar." />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ["Avaliações", String(e.total)],
              ["Média das notas", e.media !== null ? formatarNota(e.media) : "–"],
              ["Álbuns", String(e.porTipo.album)],
              ["Artistas e músicas", String(e.porTipo.artista + e.porTipo.musica)],
            ].map(([r, v]) => (
              <div key={r} className={`${card} p-4`}>
                <p className="text-xs text-white/40">{r}</p>
                <p className="mt-2 text-2xl font-semibold tabular-nums">{v}</p>
              </div>
            ))}
          </div>

          <div className={`${card} p-5`}>
            <h3 className="mb-4 font-semibold">Distribuição das notas ({rotuloPeriodo})</h3>
            <GraficoBarras titulo="Quantidade de avaliações por nota" dados={e.distribuicao} />
          </div>

          <div className={`${card} p-5`}>
            <h3 className="mb-4 font-semibold">{periodo === "tudo" ? "Avaliações por mês" : "Avaliações por dia"}</h3>
            <GraficoBarras titulo="Avaliações ao longo do tempo" dados={e.serie} cor="#d946ef" passoRotulo={e.serie.length > 14 ? 5 : e.serie.length > 8 ? 2 : 1} />
          </div>

          {e.generos.length > 0 && (
            <div className={`${card} p-5`}>
              <h3 className="mb-4 font-semibold">Gêneros mais avaliados</h3>
              <BarrasHorizontais titulo="Gêneros mais avaliados" dados={e.generos.map((g) => ({ rotulo: g.nome, valor: g.total }))} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export async function SecaoRankings({ idUsuario, nome, ehDono }: Base) {
  const [melhores, favoritos] = await Promise.all([
    avaliacoesDoUsuario(idUsuario, "tudo", { ordem: "notas", limite: 100 }),
    favoritosDoUsuario(idUsuario),
  ]);

  return (
    <div className="space-y-12">
      <section>
        <TituloSecao titulo="Melhores notas" descricao="Os itens que mais ganharam nota alta." />
        {melhores.length === 0 ? (
          <EstadoVazio titulo="Ainda não há ranking" texto={ehDono ? "Avalie itens para montar o seu ranking." : `${nome} ainda não avaliou nada.`} />
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            {TIPOS.map((tipo) => {
              const itens = melhores.filter((m) => m.tipo === tipo).slice(0, 5);
              return (
                <div key={tipo} className={`${card} p-5`}>
                  <h3 className="mb-3 font-semibold">{ROTULO_PLURAL[tipo]}</h3>
                  {itens.length === 0 ? (
                    <p className="text-sm text-white/35">Nenhuma avaliação.</p>
                  ) : (
                    <ol className="space-y-3">
                      {itens.map((i, idx) => (
                        <li key={i.idAvaliacao} className="flex items-center gap-3">
                          <span className="w-4 text-sm tabular-nums text-white/35">{idx + 1}</span>
                          <Capa src={i.imagem} nome={i.titulo} alt="" className={`h-10 w-10 shrink-0 ${tipo === "artista" ? "rounded-full" : "rounded-md"}`} />
                          <Link href={linkItem(i.tipo, i.slug)} className="min-w-0 flex-1 truncate text-sm hover:text-violet-300">{i.titulo}</Link>
                          <span className="text-sm font-semibold tabular-nums text-amber-200">{formatarNota(i.nota)}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <TituloSecao titulo="Favoritos" />
        {favoritos.length === 0 ? (
          <EstadoVazio titulo="Nenhum favorito" texto={ehDono ? "Use “Favoritar” nas páginas de artistas, álbuns e músicas." : `${nome} ainda não favoritou nada.`} />
        ) : (
          <GradeItens itens={favoritos} />
        )}
      </section>
    </div>
  );
}
