import type { Metadata } from "next";
import { redirect } from "next/navigation";
import FormularioVerificacao from "./formulario-verificacao";

export const metadata: Metadata = {
  title: "Verificar e-mail | SoundProfile",
};

export default async function VerificarEmail({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  if (!email?.trim()) {
    redirect("/cadastro");
  }

  return (
    <main className="min-h-[calc(100vh-64px)]">
      <div
        className="relative flex min-h-[calc(100vh-64px)] items-center justify-center bg-cover bg-center px-4 py-8"
        style={{ backgroundImage: "url('/background-home.webp')" }}
      >
        <div className="absolute inset-0 bg-black/80" />

        <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900/95 px-6 py-8 shadow-2xl sm:px-8">
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-violet-400"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white">
              Verifique seu e-mail
            </h1>

            <p className="mt-2 text-sm text-neutral-400">
              Estamos quase lá! Confirme seu endereço de e-mail para acessar
              sua conta do SoundProfile.
            </p>
          </div>

          <FormularioVerificacao email={email.trim().toLowerCase()} />
        </div>
      </div>
    </main>
  );
}