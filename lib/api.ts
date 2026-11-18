
import "server-only";

export type RespostaErro = {
  codigo: string | null;
  mensagem: string;
  campos: Record<string, string>;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly codigo: string | null,
    mensagem: string,
    public readonly campos: Record<string, string> = {},
  ) {
    super(mensagem);
    this.name = "ApiError";
  }
}

const API_URL = (process.env.API_URL || "http://localhost:8080").replace(/\/+$/, "");

export async function api<T>(
  caminho: string,
  opcoes: RequestInit = {},
): Promise<T> {
  let resposta: Response;

  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      ...opcoes,
      cache: "no-store",
      headers: {
        ...(opcoes.body ? { "Content-Type": "application/json" } : {}),
        ...opcoes.headers,
      },
    });
  } catch {
    throw new ApiError(
      0,
      "API_INDISPONIVEL",
      "Não foi possível conectar ao servidor. Tente novamente.",
    );
  }

  if (resposta.status === 204) {
    return undefined as T;
  }

  const corpo = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const erro = corpo as Partial<RespostaErro> | null;

    throw new ApiError(
      resposta.status,
      erro?.codigo ?? null,
      erro?.mensagem || "Não foi possível concluir a solicitação.",
      erro?.campos ?? {},
    );
  }

  return corpo as T;
}
