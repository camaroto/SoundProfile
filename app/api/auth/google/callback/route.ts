
import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { api, ApiError } from "@/lib/api";
import { guardarSessao, type SessaoResposta } from "@/lib/sessao";

const COOKIE_STATE = "sp_google_state";
const COOKIE_CADASTRO = "sp_google_cadastro";

type GoogleResposta = {
  tipo: "SESSAO" | "CADASTRO_PENDENTE";
  sessao: SessaoResposta | null;
  tokenCadastro: string | null;
  expiraEm: string | null;
  email: string | null;
  nomeExibicao: string | null;
};

const enderecoDoSite = (req: Request) =>
  process.env.APP_URL?.replace(/\/+$/, "") || new URL(req.url).origin;

const iguais = (a: string, b: string) =>
  a.length === b.length &&
  timingSafeEqual(Buffer.from(a), Buffer.from(b));

export async function GET(req: Request) {
  const para = (erro?: string) =>
    NextResponse.redirect(
      new URL(erro ? `/login?erro=${erro}` : "/", req.url)
    );

  const jar = await cookies();
  const esperado = jar.get(COOKIE_STATE)?.value;
  jar.delete(COOKIE_STATE);

  const url = new URL(req.url);

  if (url.searchParams.get("error")) return para("GOOGLE_CANCELADO");

  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");

  if (!esperado || !state || !code || !iguais(esperado, state)) {
    return para("GOOGLE_FALHA");
  }

  try {
    const resposta = await api<GoogleResposta>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({
        code,
        redirectUri: `${enderecoDoSite(req)}/api/auth/google/callback`,
      }),
    });

    if (resposta.tipo === "SESSAO" && resposta.sessao) {
      jar.delete(COOKIE_CADASTRO);
      await guardarSessao(resposta.sessao);
      return para();
    }

    if (
      resposta.tipo === "CADASTRO_PENDENTE" &&
      resposta.tokenCadastro &&
      resposta.expiraEm
    ) {
      const expiraEm = new Date(resposta.expiraEm);

      if (Number.isNaN(expiraEm.getTime()) || expiraEm <= new Date()) {
        return para("GOOGLE_FALHA");
      }

      jar.delete("sp_sessao");

      jar.set(COOKIE_CADASTRO, resposta.tokenCadastro, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: expiraEm,
      });

      return NextResponse.redirect(
        new URL("/completar-cadastro", req.url)
      );
    }

    return para("GOOGLE_FALHA");
  } catch (erro) {
    if (erro instanceof ApiError && erro.codigo) {
      return para(erro.codigo);
    }

    console.error("Falha no login com Google:", erro);
    return para("GOOGLE_FALHA");
  }
}