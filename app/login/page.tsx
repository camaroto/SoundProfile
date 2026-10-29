import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { obterUsuarioLogado } from "@/lib/sessao";
import FormularioLogin from "./formulario-login";

export const metadata: Metadata = {
  title: "Entrar | SoundProfile",
};

export default async function EntrarConta({
  searchParams,
}: {
  searchParams: Promise<{ cadastro?: string }>;
}) {
  if (await obterUsuarioLogado()) redirect("/");

  const { cadastro } = await searchParams;

  return (
    <main className="min-h-[calc(100vh-64px)]">
      <div
        className="relative flex min-h-[calc(100vh-64px)] items-center justify-center bg-cover bg-center px-4 py-8"
        style={{ backgroundImage: "url('/background-home.webp')" }}
      >
        <div className="absolute inset-0 bg-black/80" />

        <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900/95 px-6 py-8 shadow-2xl sm:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white">Entrar</h1>
            <p className="mt-2 text-sm text-neutral-400">
              Entre na sua conta do SoundProfile
            </p>
          </div>

          {cadastro === "ok" && (
            <p
              role="status"
              className="mb-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-sm text-emerald-300"
            >
              Conta criada com sucesso! Agora é só entrar.
            </p>
          )}

          <FormularioLogin />
        </div>
      </div>
    </main>
  );
}
