import { query } from "./db";
import { MINIMO_PARA_MEDIA, padraoBusca } from "./constantes";

export type GeneroLink = { slug: string; nome: string };

export type ArtistaItem = {
  idArtista: number;
  slug: string;
  nome: string;
  imagem: string | null;
  generos: GeneroLink[];
  media: number | null; // null enquanto há menos avaliações que o mínimo
  total: number;
};

export type AlbumItem = {
  idAlbum: number;
  slug: string;
  titulo: string;
  ano: number | null;
  capa: string | null;
  artista: string;
  artistaSlug: string;
  media: number | null;
  total: number;
};

export type MusicaItem = {
  idMusica: number;
  slug: string;
  titulo: string;
  faixa: number | null;
  artista: string;
  artistaSlug: string;
  albumTitulo: string | null;
  albumSlug: string | null;
  capa: string | null;
  media: number | null;
  total: number;
};

export type Genero = GeneroLink & { idGenero: number; artistas: number; albuns: number };

type Opcoes = {
  q?: string;
  genero?: string;
  ordem?: "recentes" | "melhores";
  limite?: number;
  pagina?: number;
};

const visivel = (media: number | null, total: number) =>
  total >= MINIMO_PARA_MEDIA ? media : null;

// Média e total de avaliações de um item, calculados na própria consulta.
const AGREGADO = (coluna: string, tabela: string) =>
  `LEFT JOIN LATERAL (SELECT AVG(nota)::float8 AS media, COUNT(*)::int AS total
                        FROM Avaliacao WHERE ${coluna} = ${tabela}.${coluna}) r ON true`;

const GENEROS_JSON = `(SELECT COALESCE(json_agg(json_build_object('slug', g.slug, 'nome', g.nome) ORDER BY g.nome), '[]'::json)
                        FROM ArtistaGenero ag JOIN Genero g ON g.idGenero = ag.idGenero
                       WHERE ag.idArtista = ar.idArtista)`;

const FILTRO_GENERO = `($2::text IS NULL OR EXISTS (
    SELECT 1 FROM ArtistaGenero ag JOIN Genero g ON g.idGenero = ag.idGenero
     WHERE ag.idArtista = ar.idArtista AND g.slug = $2))`;

const ORDEM_MELHORES = `(CASE WHEN r.total >= ${MINIMO_PARA_MEDIA} THEN r.media END) DESC NULLS LAST, r.total DESC`;

function paginacao({ limite = 24, pagina = 1 }: Opcoes) {
  const l = Math.min(Math.max(limite, 1), 60);
  return { limite: l, offset: (Math.max(pagina, 1) - 1) * l };
}

export type Pagina<T> = { itens: T[]; total: number };

export async function listarArtistas(o: Opcoes = {}): Promise<Pagina<ArtistaItem>> {
  const { limite, offset } = paginacao(o);
  const q = o.q?.trim() ? padraoBusca(o.q.trim()) : null;
  const ordem = o.ordem === "melhores" ? `${ORDEM_MELHORES}, ar.nome` : "ar.criadoEm DESC, ar.idArtista DESC";
  const linhas = await query<{
    idartista: number; slug: string; nome: string; imagem: string | null;
    generos: GeneroLink[]; media: number | null; total: number; geral: number;
  }>(
    `SELECT ar.idArtista, ar.slug, ar.nome, ar.imagem, ${GENEROS_JSON} AS generos,
            r.media, r.total, COUNT(*) OVER()::int AS geral
       FROM Artista ar ${AGREGADO("idArtista", "ar")}
      WHERE ($1::text IS NULL OR ar.nome ILIKE $1) AND ${FILTRO_GENERO}
      ORDER BY ${ordem} LIMIT $3 OFFSET $4`,
    [q, o.genero ?? null, limite, offset],
  );
  return {
    total: linhas[0]?.geral ?? 0,
    itens: linhas.map((l) => ({
      idArtista: l.idartista, slug: l.slug, nome: l.nome, imagem: l.imagem,
      generos: l.generos, media: visivel(l.media, l.total), total: l.total,
    })),
  };
}

export async function listarAlbuns(o: Opcoes = {}): Promise<Pagina<AlbumItem>> {
  const { limite, offset } = paginacao(o);
  const q = o.q?.trim() ? padraoBusca(o.q.trim()) : null;
  const ordem = o.ordem === "melhores" ? `${ORDEM_MELHORES}, al.titulo` : "al.criadoEm DESC, al.idAlbum DESC";
  const linhas = await query<{
    idalbum: number; slug: string; titulo: string; ano: number | null; capa: string | null;
    artista: string; artistaslug: string; media: number | null; total: number; geral: number;
  }>(
    `SELECT al.idAlbum, al.slug, al.titulo, al.ano, al.capa, ar.nome AS artista, ar.slug AS artistaslug,
            r.media, r.total, COUNT(*) OVER()::int AS geral
       FROM Album al JOIN Artista ar ON ar.idArtista = al.idArtista ${AGREGADO("idAlbum", "al")}
      WHERE ($1::text IS NULL OR al.titulo ILIKE $1 OR ar.nome ILIKE $1) AND ${FILTRO_GENERO}
      ORDER BY ${ordem} LIMIT $3 OFFSET $4`,
    [q, o.genero ?? null, limite, offset],
  );
  return {
    total: linhas[0]?.geral ?? 0,
    itens: linhas.map((l) => ({
      idAlbum: l.idalbum, slug: l.slug, titulo: l.titulo, ano: l.ano, capa: l.capa,
      artista: l.artista, artistaSlug: l.artistaslug, media: visivel(l.media, l.total), total: l.total,
    })),
  };
}

const COLUNAS_MUSICA = `mu.idMusica, mu.slug, mu.titulo, mu.faixa, ar.nome AS artista, ar.slug AS artistaslug,
            al.titulo AS albumtitulo, al.slug AS albumslug, al.capa, r.media, r.total`;
const JOINS_MUSICA = `FROM Musica mu JOIN Artista ar ON ar.idArtista = mu.idArtista
       LEFT JOIN Album al ON al.idAlbum = mu.idAlbum ${AGREGADO("idMusica", "mu")}`;

type LinhaMusica = {
  idmusica: number; slug: string; titulo: string; faixa: number | null; artista: string;
  artistaslug: string; albumtitulo: string | null; albumslug: string | null; capa: string | null;
  media: number | null; total: number; geral?: number;
};

const mapMusica = (l: LinhaMusica): MusicaItem => ({
  idMusica: l.idmusica, slug: l.slug, titulo: l.titulo, faixa: l.faixa, artista: l.artista,
  artistaSlug: l.artistaslug, albumTitulo: l.albumtitulo, albumSlug: l.albumslug, capa: l.capa,
  media: visivel(l.media, l.total), total: l.total,
});

export async function listarMusicas(o: Opcoes = {}): Promise<Pagina<MusicaItem>> {
  const { limite, offset } = paginacao(o);
  const q = o.q?.trim() ? padraoBusca(o.q.trim()) : null;
  const ordem = o.ordem === "melhores" ? `${ORDEM_MELHORES}, mu.titulo` : "mu.criadoEm DESC, mu.idMusica DESC";
  const linhas = await query<LinhaMusica>(
    `SELECT ${COLUNAS_MUSICA}, COUNT(*) OVER()::int AS geral ${JOINS_MUSICA}
      WHERE ($1::text IS NULL OR mu.titulo ILIKE $1 OR ar.nome ILIKE $1) AND ${FILTRO_GENERO}
      ORDER BY ${ordem} LIMIT $3 OFFSET $4`,
    [q, o.genero ?? null, limite, offset],
  );
  return { total: linhas[0]?.geral ?? 0, itens: linhas.map(mapMusica) };
}

export async function listarGeneros(): Promise<Genero[]> {
  const linhas = await query<{ idgenero: number; slug: string; nome: string; artistas: number; albuns: number }>(
    `SELECT g.idGenero, g.slug, g.nome,
            (SELECT COUNT(*)::int FROM ArtistaGenero ag WHERE ag.idGenero = g.idGenero) AS artistas,
            (SELECT COUNT(*)::int FROM ArtistaGenero ag JOIN Album al ON al.idArtista = ag.idArtista
              WHERE ag.idGenero = g.idGenero) AS albuns
       FROM Genero g ORDER BY artistas DESC, g.nome`,
  );
  return linhas.map((l) => ({ idGenero: l.idgenero, slug: l.slug, nome: l.nome, artistas: l.artistas, albuns: l.albuns }));
}

export async function buscarGenero(slug: string): Promise<GeneroLink | null> {
  const linhas = await query<GeneroLink>("SELECT slug, nome FROM Genero WHERE slug = $1", [slug]);
  return linhas[0] ?? null;
}

// ===== Páginas de detalhe =====

export type ArtistaDetalhe = ArtistaItem & { biografia: string };
export async function buscarArtista(slug: string): Promise<ArtistaDetalhe | null> {
  const linhas = await query<{
    idartista: number; slug: string; nome: string; imagem: string | null; biografia: string;
    generos: GeneroLink[]; media: number | null; total: number;
  }>(
    `SELECT ar.idArtista, ar.slug, ar.nome, ar.imagem, ar.biografia, ${GENEROS_JSON} AS generos, r.media, r.total
       FROM Artista ar ${AGREGADO("idArtista", "ar")} WHERE ar.slug = $1`,
    [slug],
  );
  const l = linhas[0];
  return l
    ? { idArtista: l.idartista, slug: l.slug, nome: l.nome, imagem: l.imagem, biografia: l.biografia,
        generos: l.generos, media: visivel(l.media, l.total), total: l.total }
    : null;
}

export async function albunsDoArtista(idArtista: number): Promise<AlbumItem[]> {
  const linhas = await query<{
    idalbum: number; slug: string; titulo: string; ano: number | null; capa: string | null;
    artista: string; artistaslug: string; media: number | null; total: number;
  }>(
    `SELECT al.idAlbum, al.slug, al.titulo, al.ano, al.capa, ar.nome AS artista, ar.slug AS artistaslug, r.media, r.total
       FROM Album al JOIN Artista ar ON ar.idArtista = al.idArtista ${AGREGADO("idAlbum", "al")}
      WHERE al.idArtista = $1 ORDER BY al.ano DESC NULLS LAST, al.titulo`,
    [idArtista],
  );
  return linhas.map((l) => ({
    idAlbum: l.idalbum, slug: l.slug, titulo: l.titulo, ano: l.ano, capa: l.capa, artista: l.artista,
    artistaSlug: l.artistaslug, media: visivel(l.media, l.total), total: l.total,
  }));
}

export async function musicasDoArtista(idArtista: number, limite = 10): Promise<MusicaItem[]> {
  const linhas = await query<LinhaMusica>(
    `SELECT ${COLUNAS_MUSICA} ${JOINS_MUSICA} WHERE mu.idArtista = $1
      ORDER BY ${ORDEM_MELHORES}, mu.titulo LIMIT $2`,
    [idArtista, limite],
  );
  return linhas.map(mapMusica);
}

export type AlbumDetalhe = AlbumItem & { artistaId: number; generos: GeneroLink[] };
export async function buscarAlbum(slug: string): Promise<AlbumDetalhe | null> {
  const linhas = await query<{
    idalbum: number; slug: string; titulo: string; ano: number | null; capa: string | null;
    artista: string; artistaslug: string; idartista: number; generos: GeneroLink[];
    media: number | null; total: number;
  }>(
    `SELECT al.idAlbum, al.slug, al.titulo, al.ano, al.capa, ar.nome AS artista, ar.slug AS artistaslug,
            ar.idArtista, ${GENEROS_JSON} AS generos, r.media, r.total
       FROM Album al JOIN Artista ar ON ar.idArtista = al.idArtista ${AGREGADO("idAlbum", "al")}
      WHERE al.slug = $1`,
    [slug],
  );
  const l = linhas[0];
  return l
    ? { idAlbum: l.idalbum, slug: l.slug, titulo: l.titulo, ano: l.ano, capa: l.capa, artista: l.artista,
        artistaSlug: l.artistaslug, artistaId: l.idartista, generos: l.generos,
        media: visivel(l.media, l.total), total: l.total }
    : null;
}

export async function faixasDoAlbum(idAlbum: number): Promise<MusicaItem[]> {
  const linhas = await query<LinhaMusica>(
    `SELECT ${COLUNAS_MUSICA} ${JOINS_MUSICA} WHERE mu.idAlbum = $1
      ORDER BY mu.faixa NULLS LAST, mu.titulo`,
    [idAlbum],
  );
  return linhas.map(mapMusica);
}

export type MusicaDetalhe = MusicaItem & { artistaId: number; generos: GeneroLink[] };
export async function buscarMusica(slug: string): Promise<MusicaDetalhe | null> {
  const linhas = await query<LinhaMusica & { idartista: number; generos: GeneroLink[] }>(
    `SELECT ${COLUNAS_MUSICA}, ar.idArtista, ${GENEROS_JSON} AS generos ${JOINS_MUSICA} WHERE mu.slug = $1`,
    [slug],
  );
  const l = linhas[0];
  return l ? { ...mapMusica(l), artistaId: l.idartista, generos: l.generos } : null;
}

export async function contagens() {
  const [l] = await query<{ artistas: number; albuns: number; musicas: number; membros: number; avaliacoes: number }>(
    `SELECT (SELECT COUNT(*)::int FROM Artista) AS artistas, (SELECT COUNT(*)::int FROM Album) AS albuns,
            (SELECT COUNT(*)::int FROM Musica) AS musicas,
            (SELECT COUNT(*)::int FROM Usuario WHERE status = 'ativa') AS membros,
            (SELECT COUNT(*)::int FROM Avaliacao) AS avaliacoes`,
  );
  return l;
}
