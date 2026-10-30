import Link from "next/link";
import { buscarPerfil } from "@/lib/perfis";
import { totaisDoUsuario, generosDoUsuario } from "@/lib/estatisticas";
import { avaliacoesDoUsuario, favoritosDoUsuario } from "@/lib/avaliacoes";
import { contagens, relacaoCom } from "@/lib/seguidores";
import { DiscoRating } from "@/app/components/disco-rating";
import { formatarNota } from "@/app/components/disco-rating/formatar";
import { linkItem } from "@/app/components/ui";
import { ROTULO } from "@/lib/constantes";
import Avatar from "./avatar";
import { AcoesSeguir } from "./acoes-seguir";

const mesAno = (d: Date) => new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(d);

// Cartão do perfil que abre ao lado do chat. Só mostra dados que o SoundProfile tem
// de verdade: avaliações, favoritos e gêneros. (Horas ouvidas e molduras entram quando
// existirem a integração com streaming e a loja.)
export default async function PainelPerfil({ eu, username }: { eu: number; username: string }) {
  const perfil = await buscarPerfil(username);
  if (!perfil) return <p className="p-6 text-sm text-white/50">Perfil indisponível.</p>;

  const [totais, favoritos, recentes, generos, rede, relacao] = await Promise.all([
    totaisDoUsuario(perfil.idUsuario),
    favoritosDoUsuario(perfil.idUsuario, 6),
    avaliacoesDoUsuario(perfil.idUsuario, "tudo", { limite: 3 }),
    generosDoUsuario(perfil.idUsuario, 4),
    contagens(perfil.idUsuario),
    relacaoCom(eu, perfil.idUsuario),
  ]);
  const nome = perfil.nomeExibicao || perfil.username;

  return (
    <div className="pb-8">
      <div className="relative h-28 bg-gradient-to-br from-violet-950 via-[#171020] to-fuchsia-950">
        {perfil.banner && <img src={perfil.banner} alt="" className="h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0d16] to-transparent" />
      </div>

      <div className="-mt-10 px-5">
        <Avatar src={perfil.avatar} nome={nome} className="h-20 w-20 border-4 border-[#0f0d16] text-2xl" />
        <h2 className="mt-3 break-words text-xl font-semibold">{nome}</h2>
        <p className="text-sm text-white/45">@{perfil.username}</p>

        <div className="mt-4"><AcoesSeguir seguindo={relacao.seguindo} meSegue={relacao.meSegue} idUsuario={perfil.idUsuario} nome={nome} /></div>

        {perfil.biografia && <p className="mt-4 whitespace-pre-line text-sm leading-6 text-white/70">{perfil.biografia}</p>}

        <dl className="mt-5 space-y-3 border-t border-white/10 pt-4 text-sm">
          <div><dt className="text-xs uppercase tracking-wider text-white/35">Membro desde</dt><dd className="mt-0.5 text-white/75">{mesAno(perfil.dataCadastro)}</dd></div>
        </dl>

        <div className="mt-5 grid grid-cols-2 gap-2 text-center">
          {[
            ["Seguidores", String(rede.seguidores)],
            ["Seguindo", String(rede.seguindo)],
            ["Avaliações", String(totais.avaliacoes)],
            ["Média", totais.media !== null ? formatarNota(totais.media) : "–"],
          ].map(([rotulo, valor]) => (
            <div key={rotulo} className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-2 py-3">
              <p className="text-lg font-semibold tabular-nums">{valor}</p>
              <p className="text-[11px] text-white/40">{rotulo}</p>
            </div>
          ))}
        </div>

        {generos.length > 0 && (
          <section className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/45">Gêneros mais avaliados</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {generos.map((g) => (
                <li key={g.slug}>
                  <Link href={`/generos/${g.slug}`} className="inline-block rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200 hover:bg-violet-500/20">{g.nome}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/45">Favoritos</h3>
          {favoritos.length === 0 ? (
            <p className="mt-2 text-sm text-white/35">{nome} ainda não favoritou nada.</p>
          ) : (
            <ul className="mt-2 grid grid-cols-3 gap-2">
              {favoritos.map((f) => (
                <li key={`${f.tipo}-${f.slug}`}>
                  <Link href={linkItem(f.tipo, f.slug)} className="group block" title={`${f.titulo} (${ROTULO[f.tipo]})`}>
                    <span className={`block aspect-square overflow-hidden bg-gradient-to-br from-violet-950 to-fuchsia-950 ${f.tipo === "artista" ? "rounded-full" : "rounded-lg"}`}>
                      {f.imagem && <img src={f.imagem} alt={`Capa de ${f.titulo}`} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />}
                    </span>
                    <span className="mt-1 block truncate text-[11px] text-white/55 group-hover:text-violet-300">{f.titulo}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {recentes.length > 0 && (
          <section className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/45">Avaliações recentes</h3>
            <ul className="mt-2 space-y-2">
              {recentes.map((r) => (
                <li key={r.idAvaliacao} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
                  <Link href={linkItem(r.tipo, r.slug)} className="block truncate text-sm font-medium hover:text-violet-300">{r.titulo}</Link>
                  <div className="mt-1"><DiscoRating nota={r.nota} tamanho={14} /></div>
                  {r.comentario && <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-white/50">{r.comentario}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        <Link href={`/perfil/${perfil.username}`} className="mt-6 block rounded-xl bg-violet-600 px-4 py-3 text-center text-sm font-semibold transition hover:bg-violet-500">
          Ver perfil completo
        </Link>
      </div>
    </div>
  );
}
