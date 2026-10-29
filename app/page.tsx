import Link from "next/link";
import { listarAlbuns, listarArtistas, listarGeneros } from "@/lib/catalogo";
import { avaliacoesRecentes, listarMembros } from "@/lib/comunidade";
import { obterUsuarioLogado } from "@/lib/sessao";
import { DiscoRating } from "@/app/components/disco-rating";
import { CartaoAlbum, CartaoArtista, Capa, EstadoVazio, formatarData, linkItem } from "@/app/components/ui";

const navegacao = [
  { nome: "Social", href: "#comunidade" },
  { nome: "Álbuns", href: "#albuns" },
  { nome: "Reviews", href: "#reviews" },
  { nome: "Gêneros", href: "#generos" },
  { nome: "Rankings", href: "#rankings" },
];

function TituloSecao({ titulo, descricao, acao }: { titulo: string; descricao?: string; acao?: { href: string; rotulo: string } }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="mt-1 h-8 w-1 shrink-0 rounded-full bg-violet-500 shadow-[0_0_16px_rgba(139,92,246,0.35)]" />
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{titulo}</h2>
          {descricao && <p className="mt-1 text-sm text-neutral-500">{descricao}</p>}
        </div>
      </div>
      {acao && (
        <Link href={acao.href} className="shrink-0 text-sm font-medium text-violet-400 transition hover:text-violet-300">
          {acao.rotulo}
        </Link>
      )}
    </div>
  );
}

export default async function Home() {
  const [usuario, membros, albuns, melhores, artistas, reviews, generos] = await Promise.all([
    obterUsuarioLogado(),
    listarMembros({ ordem: "ativos", limite: 8 }),
    listarAlbuns({ limite: 8 }),
    listarAlbuns({ ordem: "melhores", limite: 4 }),
    listarArtistas({ ordem: "melhores", limite: 6 }),
    avaliacoesRecentes(4, true),
    listarGeneros(),
  ]);
  const ranking = melhores.itens.filter((a) => a.media !== null);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#09090b] text-white">
      {/* Fundo limitado à área superior */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[650px] bg-cover bg-top bg-no-repeat opacity-70"
        style={{ backgroundImage: "url('/background-home.webp')" }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[850px] bg-gradient-to-b from-black/50 via-[#09090b]/70 to-[#09090b]" />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-24 z-0 h-80 w-[min(800px,100%)] -translate-x-1/2 rounded-full bg-violet-700/20 blur-[120px]" />

      <main className="relative z-10">
        {/* Hero */}
        <section className="px-6 pb-16 pt-20 text-center sm:pb-24 sm:pt-28">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-violet-400">Sua música. Sua identidade.</p>

          <h1 className="mx-auto max-w-4xl text-5xl font-black tracking-tight sm:text-7xl lg:text-8xl">
            Seu mundo musical,
            <span className="mt-1 block text-violet-400">em um só lugar.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-neutral-300 sm:text-lg">
            Reúna seus artistas favoritos, compartilhe reviews, crie listas e descubra pessoas que sentem a música como você.
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-500">
            Um espaço para registrar suas descobertas e mostrar sua identidade musical.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            {usuario ? (
              <Link href={`/perfil/${usuario.username}`} className="rounded-xl bg-violet-600 px-8 py-4 font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:-translate-y-0.5 hover:bg-violet-500">
                Ver meu perfil
              </Link>
            ) : (
              <Link href="/cadastro" className="rounded-xl bg-violet-600 px-8 py-4 font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:-translate-y-0.5 hover:bg-violet-500">
                Crie seu perfil
              </Link>
            )}
            <Link href="/musica" className="rounded-xl border border-white/15 bg-white/5 px-8 py-4 font-semibold text-white transition hover:border-violet-500/50 hover:bg-white/10">
              Explorar músicas
            </Link>
          </div>

          <div className="mx-auto mt-12 flex max-w-xs items-center justify-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-violet-500/40" />
            <span className="text-xs tracking-widest text-neutral-500">SOUNDPROFILE</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-violet-500/40" />
          </div>
        </section>

        <nav aria-label="Navegação da página" className="relative z-20 border-y border-white/10 bg-[#09090b] shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 py-3 sm:justify-center sm:gap-4">
            {navegacao.map((item) => (
              <a key={item.nome} href={item.href} className="shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-neutral-400 transition hover:bg-violet-500/10 hover:text-white">
                {item.nome}
              </a>
            ))}
          </div>
        </nav>

        {/* Comunidade */}
        <section id="comunidade" className="scroll-mt-32 border-b border-white/5 bg-neutral-950/40 px-5 py-14 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <TituloSecao titulo="Encontre sua comunidade" descricao="Os membros mais ativos do SoundProfile." acao={{ href: "/membros", rotulo: "Ver membros" }} />
            {membros.length === 0 ? (
              <EstadoVazio titulo="Ainda não há membros" texto="Crie a primeira conta e comece a avaliar." acao={{ href: "/cadastro", rotulo: "Criar conta" }} />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {membros.map((m) => (
                  <Link key={m.idUsuario} href={`/perfil/${m.username}`} className="group flex min-w-0 items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:bg-white/[0.06]">
                    <Capa src={m.avatar} nome={m.nomeExibicao || m.username} alt="" className="h-14 w-14 shrink-0 rounded-full border border-violet-500/30" />
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-white group-hover:text-violet-300">{m.nomeExibicao || m.username}</h3>
                      <p className="truncate text-sm text-neutral-500">@{m.username}</p>
                      <p className="mt-1 truncate text-xs text-violet-400">{m.avaliacoes} avaliaç{m.avaliacoes === 1 ? "ão" : "ões"}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Álbuns */}
        <section id="albuns" className="scroll-mt-32 px-5 py-14 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <TituloSecao titulo="Álbuns recentes" descricao="Os últimos álbuns adicionados ao catálogo." acao={{ href: "/musica?tipo=album", rotulo: "Ver todos" }} />
            {albuns.itens.length === 0 ? (
              <EstadoVazio titulo="O catálogo ainda está vazio" texto="Os álbuns aparecem aqui assim que forem cadastrados." />
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{albuns.itens.map((a) => <CartaoAlbum key={a.idAlbum} album={a} />)}</div>
            )}
          </div>
        </section>

        {/* Reviews */}
        <section id="reviews" className="scroll-mt-32 border-y border-white/5 bg-neutral-950/40 px-5 py-14 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <TituloSecao titulo="Reviews recentes" descricao="O que a comunidade tem escrito." />
            {reviews.length === 0 ? (
              <EstadoVazio titulo="Nenhuma review escrita ainda" texto="Avalie um álbum e escreva um comentário para aparecer aqui." />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {reviews.map((r) => (
                  <article key={r.idAvaliacao} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                    <Link href={linkItem(r.tipo, r.slug)} className="shrink-0">
                      <Capa src={r.imagem} nome={r.titulo} alt={`Capa de ${r.titulo}`} className={`h-20 w-20 ${r.tipo === "artista" ? "rounded-full" : "rounded-xl"}`} />
                    </Link>
                    <div className="min-w-0">
                      <Link href={linkItem(r.tipo, r.slug)} className="block truncate font-semibold hover:text-violet-300">{r.titulo}</Link>
                      <p className="truncate text-xs text-neutral-500">
                        <Link href={`/perfil/${r.username}`} className="hover:text-violet-300">@{r.username}</Link> · {formatarData(r.data)}
                      </p>
                      <div className="mt-2"><DiscoRating nota={r.nota} tamanho={14} /></div>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-300">{r.comentario}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Gêneros */}
        <section id="generos" className="scroll-mt-32 px-5 py-14 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <TituloSecao titulo="Explore por gênero" descricao="Do rock ao jazz, passando pela MPB." acao={{ href: "/generos", rotulo: "Ver todos" }} />
            <ul className="flex flex-wrap gap-3">
              {generos.slice(0, 12).map((g) => (
                <li key={g.slug}>
                  <Link href={`/generos/${g.slug}`} className="inline-block rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium transition hover:border-violet-400/40 hover:bg-violet-500/10">
                    {g.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Rankings */}
        <section id="rankings" className="scroll-mt-32 border-t border-white/5 bg-neutral-950/40 px-5 py-14 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl space-y-12">
            <div>
              <TituloSecao titulo="Mais bem avaliados" descricao="Álbuns com as melhores médias da comunidade." acao={{ href: "/musica?tipo=album&ordem=melhores", rotulo: "Ver todos" }} />
              {ranking.length === 0 ? (
                <EstadoVazio titulo="O ranking ainda não existe" texto="Um álbum entra no ranking quando recebe avaliações suficientes da comunidade." />
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{ranking.map((a) => <CartaoAlbum key={a.idAlbum} album={a} />)}</div>
              )}
            </div>

            {artistas.itens.length > 0 && (
              <div>
                <TituloSecao titulo="Artistas" acao={{ href: "/musica?tipo=artista", rotulo: "Ver todos" }} />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">{artistas.itens.map((a) => <CartaoArtista key={a.idArtista} artista={a} />)}</div>
              </div>
            )}
          </div>
        </section>

        <section className="relative overflow-hidden border-t border-violet-500/15 px-6 py-16 text-center sm:py-20">
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-[min(600px,100%)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-700/15 blur-[100px]" />
          <div className="relative z-10">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Sua música merece um lugar.</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-neutral-400 sm:text-base">
              Crie seu perfil, organize suas descobertas e compartilhe seu universo musical com outras pessoas.
            </p>
            {!usuario && (
              <Link href="/cadastro" className="mt-8 inline-flex rounded-xl bg-violet-600 px-8 py-4 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-violet-500">
                Faça parte do SoundProfile
              </Link>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
