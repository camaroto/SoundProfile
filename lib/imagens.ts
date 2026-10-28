import sharp from "sharp";
import type { PoolClient } from "pg";
import { query } from "./db";

export class ImagemInvalidaError extends Error {}

const FORMATOS_ACEITOS = new Set(["jpeg", "png", "webp"]);
const TAMANHOS = { avatar: [400, 400], banner: [1600, 500] } as const;

// Valida o arquivo pelo conteúdo (não pela extensão) e o regrava em WebP no
// tamanho certo. Isso descarta metadados (GPS, etc.) e qualquer coisa estranha
// escondida dentro do arquivo.
export async function processarImagem(arquivo: File, tipo: "avatar" | "banner"): Promise<Buffer> {
  const entrada = Buffer.from(await arquivo.arrayBuffer());

  try {
    const imagem = sharp(entrada, { limitInputPixels: 40_000_000 });
    const { format } = await imagem.metadata();

    if (!format || !FORMATOS_ACEITOS.has(format)) {
      throw new ImagemInvalidaError("Formato de imagem inválido. Use JPG, PNG ou WebP.");
    }

    const [largura, altura] = TAMANHOS[tipo];
    return await imagem
      .rotate() // respeita a orientação da foto antes de remover os metadados
      .resize(largura, altura, { fit: "cover" })
      .webp({ quality: 82 })
      .toBuffer();
  } catch (erro) {
    if (erro instanceof ImagemInvalidaError) throw erro;
    throw new ImagemInvalidaError("Não foi possível ler essa imagem. Tente outro arquivo.");
  }
}

export async function inserirImagem(client: PoolClient, dados: Buffer): Promise<string> {
  const r = await client.query<{ idimagem: number }>(
    "INSERT INTO Imagem (tipo, dados) VALUES ('image/webp', $1) RETURNING idImagem",
    [dados],
  );
  return `/api/imagens/${r.rows[0].idimagem}`;
}

export function idDaUrl(url: string | null): number | null {
  const m = url?.match(/^\/api\/imagens\/(\d+)$/);
  return m ? Number(m[1]) : null;
}

export async function buscarImagem(id: number): Promise<{ tipo: string; dados: Buffer } | null> {
  const linhas = await query<{ tipo: string; dados: Buffer }>(
    "SELECT tipo, dados FROM Imagem WHERE idImagem = $1",
    [id],
  );
  return linhas[0] ?? null;
}
