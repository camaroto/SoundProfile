import Link from "next/link";
import { listarAlbuns, listarArtistas, listarMusicas } from "@/lib/catalogo";
import { ROTULO_PLURAL, type TipoItem } from "@/lib/constantes";
import { card, CartaoAlbum, CartaoArtista, EstadoVazio, LinhaMusica, Paginacao, TituloSecao } from "@/app/components/ui";

const LIMITE = 24;

// Lista paginada de álbuns, artistas ou músicas, com a ordenação. "base" é a rota da aba
// (/albuns, /artistas ou /musica?tipo=musica); os links de ordem e página continuam nela.
export default async function ListaCompleta({
  tipo,
  base,
  ordem,
  pagina,
}: {
  tipo: TipoItem;
  base: string;
  ordem: "melhores" | "recentes";
  pagina: number;
}) {
  const opcoes = { ordem, pagina, limite: LIMITE };
  const resultado =
    tipo === "album" ? await listarAlbuns(opcoes) : tipo === "artista" ? await listarArtistas(opcoes) : await listarMusicas(opcoes);

  const juntar = base.includes("?") ? "&" : "?";
  const href = (o: string, p: number) => `${base}${juntar}ordem=${o}&pagina=${p}`;

  return (
    <section className="mt-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <TituloSecao titulo={ROTULO_PLURAL[tipo]} descricao={`${resultado.total} no catálogo`} />
        <div className="flex gap-2 text-sm">
          {(["recentes", "melhores"] as const).map((o) => (
            <Link
              key={o}
              href={href(o, 1)}
              aria-current={ordem === o ? "true" : undefined}
              className={`rounded-full px-3.5 py-1.5 transition ${ordem === o ? "bg-white/10 text-white" : "text-white/45 hover:text-white"}`}
            >
              {o === "recentes" ? "Mais recentes" : "Mais bem avaliados"}
            </Link>
          ))}
        </div>
      </div>

      {resultado.total === 0 ? (
        <EstadoVazio
          titulo={`Nenhum item em ${ROTULO_PLURAL[tipo].toLowerCase()}`}
          texto="Busque no Spotify para trazer novos itens para o catálogo."
          acao={{ href: "/buscar", rotulo: "Buscar" }}
        />
      ) : tipo === "musica" ? (
        <ul className={`${card} overflow-hidden`}>
          {(resultado.itens as Awaited<ReturnType<typeof listarMusicas>>["itens"]).map((m) => (
            <LinhaMusica key={m.idMusica} musica={m} />
          ))}
        </ul>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {tipo === "album"
            ? (resultado.itens as Awaited<ReturnType<typeof listarAlbuns>>["itens"]).map((a) => <CartaoAlbum key={a.idAlbum} album={a} />)
            : (resultado.itens as Awaited<ReturnType<typeof listarArtistas>>["itens"]).map((a) => <CartaoArtista key={a.idArtista} artista={a} />)}
        </div>
      )}
      <Paginacao total={resultado.total} limite={LIMITE} pagina={pagina} href={(p) => href(ordem, p)} />
    </section>
  );
}
