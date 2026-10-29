
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b] px-6 text-white">
      {/* Brilho de fundo */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-700/20 blur-[120px]" />

      <section className="relative z-10 flex max-w-xl flex-col items-center text-center">
        {/* Ícone */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="38"
            height="38"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-purple-400"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>

        {/* Código do erro */}
        <h1 className="text-8xl font-black tracking-tighter text-purple-400 sm:text-9xl">
          404
        </h1>

        <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
          Essa faixa não existe.
        </h2>

        <p className="mt-4 max-w-md leading-7 text-zinc-400">
          Parece que você saiu do setlist. A página que você está procurando
          não foi encontrada ou não está mais disponível.
        </p>

        {/* Onda sonora decorativa */}
        <div className="my-8 flex h-10 items-center justify-center gap-1">
          {[3, 6, 9, 5, 8, 4, 10, 6, 3, 7, 5, 9, 4, 6, 3].map(
            (height, index) => (
              <div
                key={index}
                style={{ height: `${height * 4}px` }}
                className="w-1 rounded-full bg-purple-500/60"
              />
            )
          )}
        </div>

        {/* Botão de retorno */}
        <Link
          href="/"
          className="rounded-lg bg-purple-600 px-7 py-3 font-semibold transition hover:bg-purple-500 hover:shadow-lg hover:shadow-purple-900/30"
        >
          Voltar para o início
        </Link>

        <p className="mt-8 text-xs tracking-widest text-zinc-600">
          SOUNDPROFILE — YOUR MUSIC, YOUR IDENTITY
        </p>
      </section>
    </main>
  );
}
