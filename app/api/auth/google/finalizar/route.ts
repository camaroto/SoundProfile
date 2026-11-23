
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { api, ApiError } from "@/lib/api";
import {
  guardarSessao,
  type SessaoResposta,
} from "@/lib/sessao";

const COOKIE_CADASTRO = "sp_google_cadastro";

export async function POST(req: Request) {
  const jar = await cookies();
  const tokenCadastro = jar.get(COOKIE_CADASTRO)?.value;

  if (!tokenCadastro) {
    return NextResponse.json(
      { mensagem: "Cadastro temporário inválido ou expirado." },
      { status: 401 }
    );
  }

  try {
    const corpo = await req.json();

    const sessao = await api<SessaoResposta>(
      "/api/auth/google/finalizar",
      {
        method: "POST",
        body: JSON.stringify({
          tokenCadastro,
          username: corpo.username,
        }),
      }
    );

    await guardarSessao(sessao);
    jar.delete(COOKIE_CADASTRO);

    return NextResponse.json({
      sucesso: true,
      usuario: sessao.usuario,
    });
  } catch (erro) {
    if (erro instanceof ApiError) {
      if (erro.status === 401) {
        jar.delete(COOKIE_CADASTRO);
      }

      return NextResponse.json(
        {
          codigo: erro.codigo,
          mensagem: erro.message,
          campos: erro.campos,
        },
        { status: erro.status || 500 }
      );
    }

    console.error("Falha ao finalizar cadastro com Google:", erro);

    return NextResponse.json(
      { mensagem: "Não foi possível finalizar seu cadastro." },
      { status: 500 }
    );
  }
}
