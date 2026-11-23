import { botaoPrimario } from "@/app/components/ui";

// Campo de busca do site (usado em Buscar e em Músicas): um só desenho para os dois.
export default function FormBusca({
  q = "",
  autoFocus = false,
  placeholder = "Artistas, álbuns, músicas, membros...",
}: {
  q?: string;
  autoFocus?: boolean;
  placeholder?: string;
}) {
  return (
    <form
      action="/buscar"
      role="search"
      className="flex max-w-xl items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1.5 pl-4 transition focus-within:border-violet-400/60 focus-within:ring-2 focus-within:ring-violet-500/25"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 shrink-0 text-white/40" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <label htmlFor="q" className="sr-only">Buscar</label>
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={q}
        autoFocus={autoFocus}
        maxLength={80}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent py-2 text-white outline-none placeholder:text-neutral-500"
      />
      <button type="submit" className={`${botaoPrimario} px-5`}>Buscar</button>
    </form>
  );
}
