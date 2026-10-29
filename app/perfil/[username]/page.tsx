import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buscarPerfil } from "@/lib/perfis";
import { obterUsuarioLogado } from "@/lib/sessao";
import { totaisDoUsuario } from "@/lib/estatisticas";
import { lerPeriodo } from "@/lib/constantes";
import { formatarNota } from "@/app/components/disco-rating/formatar";
import { SecaoAvaliacoesDoPerfil, SecaoEstatisticas, SecaoRankings, VisaoGeral } from "./secoes";

type Props = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ aba?: string; periodo?: string }>;
};

const ABAS = [
  { id: "visao", rotulo: "Visão geral" },
  { id: "avaliacoes", rotulo: "Avaliações" },
  { id: "estatisticas", rotulo: "Estatísticas" },
  { id: "rankings", rotulo: "Rankings e favoritos" },
] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const perfil = await buscarPerfil(username);
  return perfil
    ? { title: `${perfil.nomeExibicao || perfil.username} (@${perfil.username}) | SoundProfile` }
    : {};
}

export default async function PerfilPage({ params, searchParams }: Props) {
  const { username } = await params;
  const sp = await searchParams;
  const perfil = await buscarPerfil(username);

  // UC02 2a: perfil inexistente.
  if (!perfil) notFound();

  const [logado, totais] = await Promise.all([obterUsuarioLogado(), totaisDoUsuario(perfil.idUsuario)]);
  const aba = ABAS.find((a) => a.id === sp.aba)?.id ?? "visao";
  const periodo = lerPeriodo(sp.periodo);
  const ehDono = logado?.idUsuario === perfil.idUsuario;
  const nome = perfil.nomeExibicao || perfil.username;
  const membroDesde = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(
    perfil.dataCadastro,
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08070d] text-white selection:bg-violet-500/40">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 left-[15%] h-[500px] w-[500px] rounded-full bg-violet-700/15 blur-[140px]" />
        <div className="absolute right-[-180px] top-[650px] h-[450px] w-[450px] rounded-full bg-purple-600/10 blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px] opacity-30" />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-4 pb-20 pt-6 sm:px-6 lg:px-10">
        <section className="relative isolate">
          {/* Banner */}
          <div className="relative h-[250px] overflow-hidden rounded-2xl border border-white/10 sm:h-[320px] lg:h-[370px]">
            {perfil.banner ? (
              <img
                src={perfil.banner}
                alt={`Banner de ${nome}`}
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-[#171020] to-fuchsia-950" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#10091e]/80 via-[#160b2d]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08070d] via-[#08070d]/20 to-black/10" />

            <div className="absolute bottom-5 right-5 hidden items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 backdrop-blur-xl sm:flex">
              <span className="text-xs text-white/50">PROFILE ID</span>
              <span className="font-mono text-xs text-violet-300">
                SP-{perfil.username.slice(0, 8).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="relative px-4 sm:px-8">
            <div className="relative -mt-12 flex flex-col gap-5 sm:-mt-14">
              <div className="flex items-end justify-between gap-4">
                {/* Avatar */}
                <div className="relative h-24 w-24 shrink-0 sm:h-32 sm:w-32">
                  <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-br from-violet-400 via-purple-600 to-fuchsia-500 opacity-80 blur-md" />
                  <div className="relative h-full w-full overflow-hidden rounded-[25px] border border-white/20 bg-[#171020] p-1">
                    {perfil.avatar ? (
                      <img
                        src={perfil.avatar}
                        alt={`Avatar de ${nome}`}
                        className="h-full w-full rounded-[21px] object-cover"
                      />
                    ) : (
                      <div
                        role="img"
                        aria-label={`Avatar de ${nome}`}
                        className="flex h-full w-full items-center justify-center rounded-[21px] bg-gradient-to-br from-violet-950 via-[#171020] to-fuchsia-950 text-4xl font-semibold text-violet-300"
                      >
                        {nome[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {ehDono && (
                  <Link
                    href="/perfil/editar"
                    className="shrink-0 rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_25px_rgba(139,92,246,0.25)] transition hover:bg-violet-400 sm:px-5"
                  >
                    Editar perfil
                  </Link>
                )}
              </div>

              <div className="min-w-0 pb-1 pt-1 sm:pl-1">
                <h1 className="break-words text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                  {nome}
                  <span className="ml-2 text-violet-400">.</span>
                </h1>
                <p className="mt-2 text-sm text-white/45">@{perfil.username}</p>

                {perfil.biografia ? (
                  <p className="mt-3 max-w-2xl whitespace-pre-line text-sm leading-6 text-white/65 sm:text-base">
                    {perfil.biografia}
                  </p>
                ) : (
                  ehDono && (
                    <p className="mt-3 text-sm text-white/35">
                      Você ainda não escreveu uma biografia.{" "}
                      <Link href="/perfil/editar" className="text-violet-400 hover:text-violet-300">
                        Adicionar agora
                      </Link>
                    </p>
                  )
                )}

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/40">
                  {perfil.localizacao && <span>{perfil.localizacao}</span>}
                  <span>Membro desde {membroDesde}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section aria-label="Resumo" className="mt-9 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["Avaliações", String(totais.avaliacoes)],
            ["Média das notas", totais.media !== null ? formatarNota(totais.media) : "–"],
            ["Álbuns avaliados", String(totais.albuns)],
            ["Favoritos", String(totais.favoritos)],
          ].map(([rotulo, valor]) => (
            <div key={rotulo} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 backdrop-blur-xl sm:p-5">
              <p className="text-xs text-white/40">{rotulo}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">{valor}</p>
              <div className="mt-3 h-px w-8 bg-violet-400/70" />
            </div>
          ))}
        </section>

        <nav aria-label="Seções do perfil" className="mt-10 flex gap-2 overflow-x-auto border-b border-white/10 pb-3">
          {ABAS.map((a) => (
            <Link
              key={a.id}
              href={`/perfil/${perfil.username}?aba=${a.id}`}
              aria-current={aba === a.id ? "page" : undefined}
              className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition ${
                aba === a.id ? "bg-violet-500/20 text-white" : "text-white/50 hover:bg-white/5 hover:text-white"
              }`}
            >
              {a.rotulo}
            </Link>
          ))}
        </nav>

        <div className="mt-8">
          {(() => {
            const base = { idUsuario: perfil.idUsuario, username: perfil.username, nome, ehDono };
            if (aba === "avaliacoes") return <SecaoAvaliacoesDoPerfil {...base} periodo={periodo} />;
            if (aba === "estatisticas") return <SecaoEstatisticas {...base} periodo={periodo} />;
            if (aba === "rankings") return <SecaoRankings {...base} />;
            return <VisaoGeral {...base} />;
          })()}
        </div>
      </div>
    </main>
  );
}
