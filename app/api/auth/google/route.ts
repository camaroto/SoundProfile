import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_STATE = "sp_google_state";

const enderecoDoSite = (req: Request) => process.env.APP_URL?.replace(/\/+$/, "") || new URL(req.url).origin;

// Passo 1: manda a pessoa para a tela de login do Google. O "state" aleatório fica num cookie
// e volta na URL de retorno, o que impede que outro site dispare o login em nome dela (CSRF).
export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) return NextResponse.redirect(new URL("/login?erro=GOOGLE_NAO_CONFIGURADO", req.url));

  const state = randomBytes(24).toString("base64url");
  (await cookies()).set(COOKIE_STATE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth/google",
    maxAge: 600,
  });

  const parametros = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${enderecoDoSite(req)}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${parametros}`);
}
