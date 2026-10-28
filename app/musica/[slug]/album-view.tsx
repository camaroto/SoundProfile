"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { DiscoRating, DiscoRatingInput } from "@/app/components/disco-rating";
import { formatarNota } from "@/app/components/disco-rating/formatar";
import type { Album, Avaliacao } from "../dados";

type MinhaAvaliacao = { nota: number; texto: string };

const card = "rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5";
const campo =
  "w-full rounded-lg border border-white/10 bg-neutral-800 p-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30";
const botaoPrimario =
  "rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-violet-600";
const botaoSecundario =
  "rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/80 transition hover:border-violet-500/50 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400";

export default function AlbumView({
  album,
  logado,
}: {
  album: Album;
  logado: boolean;
}) {
  const [minha, setMinha] = useState<MinhaAvaliacao | null>(null);
  const [editando, setEditando] = useState(false);
  const [nota, setNota] = useState(0);
  const [texto, setTexto] = useState("");
  const [aviso, setAviso] = useState("");
  const [curtidos, setCurtidos] = useState<number[]>([]);
  const [ouvirDepois, setOuvirDepois] = useState(false);
  const [ouvido, setOuvido] = useState(false);

  // RN03: uma avaliação por usuário. Publicar de novo substitui a anterior.
  const distribuicao = album.distribuicao.map(
    (qtd, i) => qtd + (minha && Math.ceil(minha.nota) - 1 === i ? 1 : 0),
  );
  const total = distribuicao.reduce((soma, qtd) => soma + qtd, 0);
  const media =
    distribuicao.reduce((soma, qtd, i) => soma + qtd * (i + 1), 0) / total;
  const maiorGrupo = Math.max(...distribuicao);

  const avaliacoes: Avaliacao[] = minha
    ? [
        {
          id: 0,
          usuario: "Você",
          username: "voce",
          avatar: "/gato.jpg",
          nota: minha.nota,
          texto: minha.texto,
          data: "agora",
          curtidas: 0,
        },
        ...album.avaliacoes,
      ]
    : album.avaliacoes;

  const mostrandoFormulario = logado && (!minha || editando);

  function abrirEdicao() {
    if (!minha) return;
    setNota(minha.nota);
    setTexto(minha.texto);
    setEditando(true);
  }

  function publicar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (nota === 0) return;

    setAviso(minha ? "Avaliação atualizada." : "Avaliação publicada.");
    setMinha({ nota, texto: texto.trim() });
    setEditando(false);
  }

  function alternarCurtida(id: number) {
    setCurtidos((atual) =>
      atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id],
    );
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-white selection:bg-violet-500/40">
      {/* Cabeçalho do álbum */}
      <section className="relative overflow-hidden border-b border-white/10">
        <Image
          src={album.capa}
          alt=""
          fill
          sizes="100vw"
          aria-hidden="true"
          className="scale-125 object-cover opacity-25 blur-3xl"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/40 via-[#09090b]/70 to-[#09090b]" />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row sm:items-end sm:px-6 lg:px-10">
          <div className="relative h-56 w-56 shrink-0 overflow-hidden rounded-xl border border-white/15 shadow-2xl shadow-black/60 sm:h-64 sm:w-64">
            <Image
              src={album.capa}
              alt={`Capa do álbum ${album.titulo}, de ${album.artista}`}
              fill
              priority
              sizes="256px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
              {album.titulo}
            </h1>
            <p className="mt-2 text-lg text-white/70">
              <span className="font-medium text-white">{album.artista}</span>
              <span className="ml-3 text-white/45">{album.ano}</span>
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
              <div className="flex items-center gap-3">
                <span className="text-5xl font-semibold tabular-nums text-amber-200">
                  {formatarNota(media)}
                </span>
                <div>
                  <DiscoRating nota={media} tamanho={22} mostrarNumero={false} />
                  <p className="mt-1 text-xs text-white/45">
                    {total.toLocaleString("pt-BR")} avaliações
                  </p>
                </div>
              </div>

              <a href="#sua-avaliacao" className={botaoPrimario}>
                {minha ? "Ver sua avaliação" : "Avaliar este álbum"}
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-10">
        <div className="min-w-0 space-y-10">
          {/* Faixas */}
          <section aria-labelledby="titulo-faixas">
            <h2 id="titulo-faixas" className="mb-4 text-xl font-semibold">
              Lista de faixas
            </h2>
            <ol className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]">
              {album.faixas.map((faixa) => (
                <li
                  key={faixa.numero}
                  className="flex items-center gap-4 border-b border-white/[0.06] px-4 py-3 last:border-0 hover:bg-violet-500/[0.05]"
                >
                  <span className="w-6 text-right text-sm tabular-nums text-white/35">
                    {faixa.numero}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {faixa.titulo}
                  </span>
                  <DiscoRating nota={faixa.nota} tamanho={14} />
                </li>
              ))}
            </ol>
          </section>

          {/* Avaliações */}
          <section aria-labelledby="titulo-avaliacoes">
            <h2 id="titulo-avaliacoes" className="mb-4 text-xl font-semibold">
              Avaliações principais
            </h2>
            <div className="space-y-3">
              {avaliacoes.map((av) => {
                const curtiu = curtidos.includes(av.id);
                const minhaAv = av.id === 0;

                return (
                  <article
                    key={av.id}
                    className={`${card} ${minhaAv ? "border-violet-400/30" : ""}`}
                  >
                    <header className="flex items-center gap-3">
                      <img
                        src={av.avatar}
                        alt={`Avatar de ${av.usuario}`}
                        className="h-11 w-11 shrink-0 rounded-full border border-violet-500/30 object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {av.usuario}
                          <span className="ml-2 font-normal text-white/40">
                            @{av.username}
                          </span>
                        </p>
                        <p className="text-xs text-white/35">{av.data}</p>
                      </div>
                      <DiscoRating nota={av.nota} tamanho={16} />
                    </header>

                    {av.texto && (
                      <p className="mt-4 max-w-prose text-sm leading-6 text-white/70">
                        {av.texto}
                      </p>
                    )}

                    {!minhaAv && (
                      <button
                        type="button"
                        aria-pressed={curtiu}
                        onClick={() => alternarCurtida(av.id)}
                        className={`mt-4 rounded-lg border px-3 py-1.5 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                          curtiu
                            ? "border-violet-400/40 bg-violet-500/15 text-violet-200"
                            : "border-white/10 text-white/50 hover:border-violet-400/30 hover:text-white"
                        }`}
                      >
                        {curtiu ? "Curtido" : "Curtir"} · {av.curtidas + (curtiu ? 1 : 0)}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        {/* Lateral */}
        <aside className="space-y-5">
          <section id="sua-avaliacao" className={`${card} scroll-mt-24`}>
            <h2 className="text-lg font-semibold">
              {editando ? "Editar sua avaliação" : "Sua avaliação"}
            </h2>

            {!logado && (
              <div className="mt-3">
                <p className="text-sm leading-6 text-white/55">
                  Entre na sua conta para avaliar este álbum.
                </p>
                <div className="mt-4 flex gap-2">
                  <Link href="/login" className={botaoPrimario}>
                    Entrar
                  </Link>
                  <Link href="/cadastro" className={botaoSecundario}>
                    Criar conta
                  </Link>
                </div>
              </div>
            )}

            {logado && minha && !editando && (
              <div className="mt-3">
                <DiscoRating nota={minha.nota} tamanho={24} />
                {minha.texto && (
                  <p className="mt-3 text-sm leading-6 text-white/60">
                    {minha.texto}
                  </p>
                )}
                <button
                  type="button"
                  onClick={abrirEdicao}
                  className={`${botaoSecundario} mt-4 w-full`}
                >
                  Editar avaliação
                </button>
              </div>
            )}

            {mostrandoFormulario && (
              <form onSubmit={publicar} className="mt-4 space-y-4">
                <DiscoRatingInput valor={nota} onChange={setNota} />

                <div>
                  <label
                    htmlFor="comentario"
                    className="mb-2 block text-sm font-medium text-white"
                  >
                    Comentário (opcional)
                  </label>
                  <textarea
                    id="comentario"
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder="O que você achou do álbum?"
                    className={`${campo} resize-none`}
                  />
                  <p className="mt-1 text-right text-xs text-white/30">
                    {texto.length}/500
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={nota === 0}
                    className={`${botaoPrimario} flex-1`}
                  >
                    {minha ? "Salvar alterações" : "Publicar avaliação"}
                  </button>
                  {editando && (
                    <button
                      type="button"
                      onClick={() => setEditando(false)}
                      className={botaoSecundario}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            )}

            <p role="status" aria-live="polite" className="sr-only">
              {aviso}
            </p>
          </section>

          <section className={`${card} space-y-2`}>
            <button
              type="button"
              aria-pressed={ouvirDepois}
              onClick={() => setOuvirDepois((v) => !v)}
              className={`${botaoSecundario} w-full text-left ${ouvirDepois ? "!border-violet-400/40 !bg-violet-500/15 !text-violet-200" : ""}`}
            >
              {ouvirDepois ? "Na sua lista de ouvir depois" : "Ouvir depois"}
            </button>
            <button
              type="button"
              aria-pressed={ouvido}
              onClick={() => setOuvido((v) => !v)}
              className={`${botaoSecundario} w-full text-left ${ouvido ? "!border-violet-400/40 !bg-violet-500/15 !text-violet-200" : ""}`}
            >
              {ouvido ? "Marcado como ouvido" : "Marcar como ouvido"}
            </button>
          </section>

          <section className={card}>
            <h2 className="mb-4 font-semibold">Informações</h2>
            <dl className="space-y-2 text-sm">
              {[
                ["Lançamento", String(album.ano)],
                ["Gravadora", album.gravadora],
                ["Gênero", album.genero],
                ["Faixas", String(album.faixas.length)],
              ].map(([rotulo, valor]) => (
                <div key={rotulo} className="flex justify-between gap-4">
                  <dt className="text-white/40">{rotulo}</dt>
                  <dd className="text-right text-white/80">{valor}</dd>
                </div>
              ))}
            </dl>

            <h3 className="mb-3 mt-6 text-sm font-semibold">
              Distribuição das notas
            </h3>
            <ul className="space-y-2">
              {[4, 3, 2, 1, 0].map((i) => (
                <li key={i} className="flex items-center gap-3 text-xs">
                  <span className="w-3 tabular-nums text-white/50">{i + 1}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-400"
                      style={{ width: `${(distribuicao[i] / maiorGrupo) * 100}%` }}
                    />
                  </div>
                  <span className="w-10 text-right tabular-nums text-white/35">
                    {distribuicao[i]}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className={card}>
            <h2 className="mb-4 font-semibold">Mais de {album.artista}</h2>
            <ul className="space-y-3">
              {album.maisDoArtista.map((titulo) => (
                <li key={titulo} className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-950 via-[#171020] to-fuchsia-950 text-violet-300"
                  >
                    ♫
                  </span>
                  <span className="min-w-0 truncate text-sm">{titulo}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </main>
  );
}
