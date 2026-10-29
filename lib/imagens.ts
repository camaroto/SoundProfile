import sharp from "sharp";
import type { PoolClient } from "pg";
import { query } from "./db";

export class ImagemInvalidaError extends Error {}

const FORMATOS_ESTATICOS = new Set(["jpeg", "png", "webp"]);
const TAMANHOS = { avatar: [400, 400], banner: [1600, 500], capa: [640, 640] } as const;

// Limites para animações (GIF e WebP animado): um arquivo pequeno pode esconder
// milhares de quadros grandes, então conferimos antes de processar.
const MAX_QUADROS = 150;
const MAX_LADO_DO_QUADRO = 4000;
const MAX_SAIDA_ANIMADA = 3 * 1024 * 1024;

// Valida o arquivo pelo conteúdo (não pela extensão) e o regrava em WebP no
// tamanho certo. Isso descarta metadados (GPS, etc.) e qualquer coisa estranha
// escondida dentro do arquivo. Com `animada`, GIFs e WebPs animados mantêm a
// animação (só o perfil usa isso; capas do catálogo continuam estáticas).
export async function processarImagem(
  arquivo: File,
  tipo: "avatar" | "banner" | "capa",
  opcoes: { animada?: boolean } = {},
): Promise<Buffer> {
  const animada = opcoes.animada === true;
  const formatos = animada ? new Set([...FORMATOS_ESTATICOS, "gif"]) : FORMATOS_ESTATICOS;
  const entrada = Buffer.from(await arquivo.arrayBuffer());

  try {
    const imagem = sharp(entrada, {
      limitInputPixels: animada ? 100_000_000 : 40_000_000,
      animated: animada,
    });
    const meta = await imagem.metadata();

    if (!meta.format || !formatos.has(meta.format)) {
      throw new ImagemInvalidaError(
        animada ? "Formato de imagem inválido. Use JPG, PNG, WebP ou GIF." : "Formato de imagem inválido. Use JPG, PNG ou WebP.",
      );
    }

    const quadros = meta.pages ?? 1;
    // Imagem de um quadro só segue o mesmo limite das fotos comuns.
    if (quadros <= 1 && (meta.width ?? 0) * (meta.height ?? 0) > 40_000_000) {
      throw new ImagemInvalidaError("A imagem tem dimensões grandes demais.");
    }
    if (quadros > 1) {
      const altura = meta.pageHeight ?? meta.height ?? 0;
      if (quadros > MAX_QUADROS) {
        throw new ImagemInvalidaError(`A animação tem quadros demais (o máximo é ${MAX_QUADROS}).`);
      }
      if ((meta.width ?? 0) > MAX_LADO_DO_QUADRO || altura > MAX_LADO_DO_QUADRO) {
        throw new ImagemInvalidaError("As dimensões da animação são grandes demais. Use um GIF menor.");
      }
    }

    const [largura, altura] = TAMANHOS[tipo];
    // Fotos respeitam a orientação (EXIF) antes de os metadados serem removidos.
    const base = quadros > 1 ? imagem : imagem.rotate();
    const saida = await base
      .resize(largura, altura, { fit: "cover" })
      .webp({ quality: quadros > 1 ? 78 : 82 })
      .toBuffer();

    if (quadros > 1 && saida.length > MAX_SAIDA_ANIMADA) {
      throw new ImagemInvalidaError("A animação ficou pesada demais. Use um GIF menor ou com menos quadros.");
    }
    return saida;
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

// Lê um arquivo opcional de um formulário. undefined = nenhum arquivo enviado.
export async function lerImagemDoForm(
  formData: FormData,
  campo: string,
  tipo: "avatar" | "banner" | "capa",
  rotulo: string,
  limiteBytes = 2 * 1024 * 1024,
): Promise<Buffer | undefined> {
  const arquivo = formData.get(campo);
  if (!(arquivo instanceof File) || arquivo.size === 0) return undefined;
  if (arquivo.size > limiteBytes) {
    throw new ImagemInvalidaError(`${rotulo} muito grande. O limite é ${limiteBytes / 1024 / 1024} MB.`);
  }
  return processarImagem(arquivo, tipo);
}

export async function apagarImagensPorUrl(client: PoolClient, urls: (string | null)[]) {
  for (const url of urls) {
    const id = idDaUrl(url);
    if (id) await client.query("DELETE FROM Imagem WHERE idImagem = $1", [id]);
  }
}
