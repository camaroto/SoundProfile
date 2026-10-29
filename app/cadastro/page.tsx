import type { Metadata } from "next";
import FormularioCadastro from "./formulario-cadastro";

export const metadata: Metadata = {
  title: "Criar conta | SoundProfile",
};

export default function CriarContaPage() {
  return (
    <main className="min-h-[calc(100vh-64px)]">
      <div
        className="relative flex min-h-[calc(100vh-64px)] items-center justify-center bg-cover bg-center px-4 py-8"
        style={{ backgroundImage: "url('/background-home.webp')" }}
      >
        <div className="absolute inset-0 bg-black/80" />

        <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900/95 px-6 py-8 shadow-2xl sm:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white">Criar conta</h1>
            <p className="mt-2 text-sm text-neutral-400">
              Faça parte da comunidade SoundProfile
            </p>
          </div>

          <FormularioCadastro />
        </div>
      </div>
    </main>
  );
}
