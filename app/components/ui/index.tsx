import Link from "next/link";
import type { GeneroLink } from "@/lib/catalogo";
import { DiscoRating } from "@/app/components/disco-rating";
import { ROTA, type TipoItem } from "@/lib/constantes";

// Peças visuais compartilhadas pelas páginas de música, gênero, busca e perfil.

export const card = "rounded-2xl border border-white/[0.08] bg-white/[0.025]";

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10 ${className}`}>{children}</div>;
}

export function TituloSecao({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao?: string;
  acao?: { href: string; rotulo: string };
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="mt-1 h-7 w-1 shrink-0 rounded-full bg-violet-500 shadow-[0_0_16px_rgba(139,92,246,0.35)]" />
        <div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{titulo}</h2>
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

// Capa ou foto. Sem imagem, mostra um bloco com a inicial (nunca uma imagem inventada).
export function Capa({ src, alt, nome, className = "" }: { src: string | null; alt: string; nome: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-violet-950 via-[#171020] to-fuchsia-950 ${className}`}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <div role="img" aria-label={alt} className="flex h-full w-full items-center justify-center text-3xl font-semibold text-violet-300/80">
          {nome.trim()[0]?.toUpperCase() ?? "♫"}
        </div>
      )}
    </div>
  );
}

export function EstadoVazio({ titulo, texto, acao }: { titulo: string; texto?: string; acao?: { href: string; rotulo: string } }) {
  return (
    <div className={`${card} px-6 py-10 text-center`}>
      <p className="font-semibold">{titulo}</p>
      {texto && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/50">{texto}</p>}
      {acao && (
        <Link href={acao.href} className="mt-5 inline-block rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold transition hover:bg-violet-500">
          {acao.rotulo}
        </Link>
      )}
    </div>
  );
}

export function ChipsGenero({ generos }: { generos: GeneroLink[] }) {
  if (generos.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {generos.map((g) => (
        <li key={g.slug}>
          <Link
            href={`/generos/${g.slug}`}
            className="inline-block rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200 transition hover:bg-violet-500/20"
          >
            {g.nome}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Nota({ media, total }: { media: number | null; total: number }) {
  if (media !== null) return <DiscoRating nota={media} tamanho={13} />;
  return <p className="text-[11px] text-white/30">{total === 0 ? "Sem avaliações" : `${total} avaliaç${total === 1 ? "ão" : "ões"}`}</p>;
}

export function CartaoAlbum({ album }: { album: { slug: string; titulo: string; capa: string | null; artista: string; ano: number | null; media: number | null; total: number } }) {
  return (
    <Link
      href={`/album/${album.slug}`}
      className="group block rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3 transition duration-300 hover:-translate-y-1 hover:border-violet-400/25 hover:bg-white/[0.045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
    >
      <Capa src={album.capa} nome={album.titulo} alt={`Capa de ${album.titulo}`} className="aspect-square rounded-xl" />
      <h3 className="mt-3 truncate text-sm font-medium group-hover:text-violet-200">{album.titulo}</h3>
      <p className="mt-0.5 truncate text-xs text-white/45">
        {album.artista}
        {album.ano ? `, ${album.ano}` : ""}
      </p>
      <div className="mt-2">
        <Nota media={album.media} total={album.total} />
      </div>
    </Link>
  );
}

export function CartaoArtista({ artista }: { artista: { slug: string; nome: string; imagem: string | null; generos: GeneroLink[]; media: number | null; total: number } }) {
  return (
    <Link
      href={`/artista/${artista.slug}`}
      className="group block rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3 text-center transition duration-300 hover:-translate-y-1 hover:border-violet-400/25 hover:bg-white/[0.045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
    >
      <Capa src={artista.imagem} nome={artista.nome} alt={`Foto de ${artista.nome}`} className="mx-auto aspect-square w-full rounded-full" />
      <h3 className="mt-3 truncate text-sm font-medium group-hover:text-violet-200">{artista.nome}</h3>
      <p className="mt-0.5 truncate text-xs text-violet-300/70">{artista.generos.map((g) => g.nome).join(", ") || " "}</p>
      <div className="mt-2 flex justify-center">
        <Nota media={artista.media} total={artista.total} />
      </div>
    </Link>
  );
}

export function LinhaMusica({ musica, mostrarNumero = false }: { musica: { slug: string; titulo: string; faixa: number | null; artista: string; capa: string | null; media: number | null; total: number }; mostrarNumero?: boolean }) {
  return (
    <li className="border-b border-white/[0.06] last:border-0">
      <Link href={`/musica/${musica.slug}`} className="flex items-center gap-3 px-4 py-3 transition hover:bg-violet-500/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-400">
        {mostrarNumero ? (
          <span className="w-6 shrink-0 text-right text-sm tabular-nums text-white/35">{musica.faixa ?? "–"}</span>
        ) : (
          <Capa src={musica.capa} nome={musica.titulo} alt="" className="h-10 w-10 shrink-0 rounded-lg" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{musica.titulo}</p>
          {!mostrarNumero && <p className="truncate text-xs text-white/45">{musica.artista}</p>}
        </div>
        <Nota media={musica.media} total={musica.total} />
      </Link>
    </li>
  );
}

export function Paginacao({ total, limite, pagina, href }: { total: number; limite: number; pagina: number; href: (p: number) => string }) {
  const paginas = Math.max(1, Math.ceil(total / limite));
  if (paginas <= 1) return null;
  const estilo = "rounded-lg border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5";
  return (
    <nav aria-label="Paginação" className="mt-8 flex items-center justify-center gap-3">
      {pagina > 1 && <Link href={href(pagina - 1)} className={estilo}>Anterior</Link>}
      <span className="text-sm text-white/50">Página {pagina} de {paginas}</span>
      {pagina < paginas && <Link href={href(pagina + 1)} className={estilo}>Próxima</Link>}
    </nav>
  );
}

export const linkItem = (tipo: TipoItem, slug: string) => `/${ROTA[tipo]}/${slug}`;

export function formatarData(data: Date) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(data);
}

// Cabeçalho das páginas de artista, álbum e música.
export function HeroItem({
  imagem, nome, redondo = false, titulo, children,
}: {
  imagem: string | null;
  nome: string;
  redondo?: boolean;
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      {imagem && <img src={imagem} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-125 object-cover opacity-25 blur-3xl" />}
      <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/40 via-[#09090b]/70 to-[#09090b]" />
      <Container className="relative flex flex-col gap-6 py-10 sm:flex-row sm:items-end sm:gap-8">
        <Capa
          src={imagem}
          nome={nome}
          alt={`${redondo ? "Foto" : "Capa"} de ${nome}`}
          className={`h-48 w-48 shrink-0 border border-white/15 shadow-2xl shadow-black/60 sm:h-56 sm:w-56 ${redondo ? "rounded-full" : "rounded-xl"}`}
        />
        <div className="min-w-0">
          <h1 className="break-words text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">{titulo}</h1>
          {children}
        </div>
      </Container>
    </section>
  );
}

export function MediaDestaque({ media, total, minimo = 3 }: { media: number | null; total: number; minimo?: number }) {
  return (
    <div className="flex items-center gap-3">
      {media !== null ? (
        <>
          <span className="text-5xl font-semibold tabular-nums text-amber-200">{media.toFixed(1).replace(".", ",")}</span>
          <div>
            <DiscoRating nota={media} tamanho={22} mostrarNumero={false} />
            <p className="mt-1 text-xs text-white/45">Média de {total} avaliações</p>
          </div>
        </>
      ) : (
        <p className="text-sm text-white/45">
          {total === 0 ? "Ainda sem avaliações" : `${total} avaliaç${total === 1 ? "ão" : "ões"}`}
          <span className="block text-xs text-white/30">A média aparece com {minimo} avaliações.</span>
        </p>
      )}
    </div>
  );
}
