import type { PoolClient } from "pg";
import { query, transacao } from "./db";
import { gerarSlug } from "./slug";
import { apagarImagensPorUrl, inserirImagem } from "./imagens";
import type { TipoItem } from "./constantes";

// Escrita no catálogo. Só é chamada por ações que já confirmaram que o usuário é admin.

export class CatalogoError extends Error {}

type Tabela = "Artista" | "Album" | "Musica";

async function slugLivre(client: PoolClient, tabela: Tabela, texto: string) {
  const base = gerarSlug(texto);
  for (let i = 1; i < 500; i++) {
    const slug = i === 1 ? base : `${base}-${i}`;
    const r = await client.query(`SELECT 1 FROM ${tabela} WHERE slug = $1`, [slug]);
    if (r.rowCount === 0) return slug;
  }
  throw new CatalogoError("Não foi possível gerar um endereço único para este item.");
}

const imagemOuNull = (client: PoolClient, dados?: Buffer) => (dados ? inserirImagem(client, dados) : Promise.resolve(null));

export async function criarArtista(d: { nome: string; biografia: string; imagem?: Buffer; generos: number[] }): Promise<string> {
  return transacao(async (client) => {
    const slug = await slugLivre(client, "Artista", d.nome);
    const imagem = await imagemOuNull(client, d.imagem);
    const r = await client.query<{ idartista: number }>(
      "INSERT INTO Artista (slug, nome, biografia, imagem) VALUES ($1, $2, $3, $4) RETURNING idArtista",
      [slug, d.nome, d.biografia, imagem],
    );
    for (const g of new Set(d.generos)) {
      await client.query("INSERT INTO ArtistaGenero (idArtista, idGenero) VALUES ($1, $2)", [r.rows[0].idartista, g]);
    }
    return slug;
  });
}

export async function criarAlbum(d: { titulo: string; idArtista: number; ano: number | null; capa?: Buffer }): Promise<string> {
  return transacao(async (client) => {
    const artista = await client.query<{ nome: string }>("SELECT nome FROM Artista WHERE idArtista = $1", [d.idArtista]);
    if (artista.rowCount === 0) throw new CatalogoError("Artista não encontrado.");
    const slug = await slugLivre(client, "Album", `${d.titulo} ${artista.rows[0].nome}`);
    const capa = await imagemOuNull(client, d.capa);
    await client.query("INSERT INTO Album (slug, titulo, idArtista, ano, capa) VALUES ($1, $2, $3, $4, $5)", [
      slug, d.titulo, d.idArtista, d.ano, capa,
    ]);
    return slug;
  });
}

export async function criarMusica(d: { titulo: string; idArtista: number; idAlbum: number | null; faixa: number | null }): Promise<string> {
  return transacao(async (client) => {
    const artista = await client.query<{ nome: string }>("SELECT nome FROM Artista WHERE idArtista = $1", [d.idArtista]);
    if (artista.rowCount === 0) throw new CatalogoError("Artista não encontrado.");
    if (d.idAlbum !== null) {
      // Integridade: o álbum escolhido precisa ser do mesmo artista da música.
      const album = await client.query("SELECT 1 FROM Album WHERE idAlbum = $1 AND idArtista = $2", [d.idAlbum, d.idArtista]);
      if (album.rowCount === 0) throw new CatalogoError("Esse álbum não pertence ao artista escolhido.");
    }
    const slug = await slugLivre(client, "Musica", `${d.titulo} ${artista.rows[0].nome}`);
    await client.query("INSERT INTO Musica (slug, titulo, idArtista, idAlbum, faixa) VALUES ($1, $2, $3, $4, $5)", [
      slug, d.titulo, d.idArtista, d.idAlbum, d.faixa,
    ]);
    return slug;
  });
}

// Apaga o item e as imagens dele. Avaliações e favoritos saem junto (ON DELETE CASCADE).
export async function excluirItem(tipo: TipoItem, id: number): Promise<void> {
  await transacao(async (client) => {
    let imagens: (string | null)[] = [];
    if (tipo === "artista") {
      const a = await client.query<{ imagem: string | null }>("SELECT imagem FROM Artista WHERE idArtista = $1", [id]);
      const al = await client.query<{ capa: string | null }>("SELECT capa FROM Album WHERE idArtista = $1", [id]);
      imagens = [...a.rows.map((r) => r.imagem), ...al.rows.map((r) => r.capa)];
      await client.query("DELETE FROM Artista WHERE idArtista = $1", [id]);
    } else if (tipo === "album") {
      const al = await client.query<{ capa: string | null }>("SELECT capa FROM Album WHERE idAlbum = $1", [id]);
      imagens = al.rows.map((r) => r.capa);
      await client.query("DELETE FROM Album WHERE idAlbum = $1", [id]);
    } else {
      await client.query("DELETE FROM Musica WHERE idMusica = $1", [id]);
    }
    await apagarImagensPorUrl(client, imagens);
  });
}

export async function listarParaAdmin() {
  const [artistas, albuns, musicas] = await Promise.all([
    query<{ idartista: number; nome: string }>("SELECT idArtista, nome FROM Artista ORDER BY nome"),
    query<{ idalbum: number; titulo: string; idartista: number; artista: string }>(
      "SELECT al.idAlbum, al.titulo, al.idArtista, ar.nome AS artista FROM Album al JOIN Artista ar USING (idArtista) ORDER BY ar.nome, al.titulo",
    ),
    query<{ idmusica: number; titulo: string; artista: string }>(
      "SELECT mu.idMusica, mu.titulo, ar.nome AS artista FROM Musica mu JOIN Artista ar USING (idArtista) ORDER BY mu.criadoEm DESC LIMIT 100",
    ),
  ]);
  return {
    artistas: artistas.map((a) => ({ id: a.idartista, nome: a.nome })),
    albuns: albuns.map((a) => ({ id: a.idalbum, titulo: a.titulo, idArtista: a.idartista, artista: a.artista })),
    musicas: musicas.map((m) => ({ id: m.idmusica, titulo: m.titulo, artista: m.artista })),
  };
}
