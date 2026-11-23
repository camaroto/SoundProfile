
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { api, ApiError } from "@/lib/api";

const COOKIE_CADASTRO = "sp_google_cadastro";

type DisponibilidadeResposta = {
  disponivel: boolean;
};

export async function POST(req: Request) {
  const tokenCadastro = (await cookies()).get(COOKIE_CADASTRO)?.value;

  if (!tokenCadastro) {
    return NextResponse.json(
      { mensagem: "Cadastro temporário inválido ou expirado." },
      { status: 401 }
    );
  }

  try {
    const corpo = await req.json();

    const resposta = await api<DisponibilidadeResposta>(
      "/api/auth/google/username-disponivel",
      {
        method: "POST",
        body: JSON.stringify({
          tokenCadastro,
          username: corpo.username,
        }),
      }
    );

    return NextResponse.json(resposta);
  } catch (erro) {
    if (erro instanceof ApiError) {
      return NextResponse.json(
        {
          codigo: erro.codigo,
          mensagem: erro.message,
          campos: erro.campos,
        },
        { status: erro.status || 500 }
      );
    }

    return NextResponse.json(
      { mensagem: "Não foi possível verificar o nome de usuário." },
      { status: 500 }
    );
  }
}
