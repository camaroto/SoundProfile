
import Link from "next/link";

const FOOTER_SECTIONS = [
  {
    title: "EXPLORAR",
    links: [
      { label: "Buscar", href: "/buscar" },
      { label: "Músicas", href: "/musica" },
      { label: "Gêneros", href: "/generos" },
      { label: "Artistas", href: "/musica?tipo=artista" },
      { label: "Membros", href: "/membros" },
    ],
  },
  {
    title: "SOUNDPROFILE",
    links: [{ label: "SoundProfile Pro", href: "/pro" }],
  },
];

export default function Footer() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-violet-500/20 bg-[#0b0c0f] text-white">

      {/* Brilho roxo de fundo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[600px] max-w-full -translate-x-1/2 rounded-full bg-violet-700/20 blur-[100px]"
      />

      {/* Brilho complementar sutil */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 right-0 h-56 w-56 rounded-full bg-purple-600/10 blur-[90px]"
      />

      {/* Conteúdo principal */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10">

        {/* Marca e seções de links */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4 lg:gap-16">

          {/* Marca */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              aria-label="SoundProfile - página inicial"
              className="inline-flex items-center gap-3"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-xl font-black transition hover:bg-violet-500">
                S
              </span>

              <span className="text-lg font-bold tracking-tight">
                Sound<span className="text-violet-400">Profile</span>
              </span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-6 text-neutral-400">
              Toda sua jornada musical em um só lugar.
              Descubra artistas, compartilhe suas opiniões
              e encontre pessoas que sentem a música como você.
            </p>

            <p className="mt-5 text-xs font-medium tracking-wider text-violet-400">
              SUA MÚSICA. SUA IDENTIDADE.
            </p>
          </div>

          {/* Seções de links */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="border-l-2 border-violet-500 pl-3 text-xs font-bold tracking-[0.15em] text-neutral-200">
                {section.title}
              </h3>

              <ul className="mt-5 flex flex-col gap-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-400 transition-colors hover:text-violet-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Rodapé inferior */}
        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} SoundProfile. Todos os direitos reservados.
          </p>

          <Link
            href="/"
            className="transition hover:text-violet-400"
          >
            Feito para quem vive música.
          </Link>
        </div>
      </div>
    </footer>
  );
}
