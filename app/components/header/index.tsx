
"use client";

import { useState, FormEvent, MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sair } from "@/app/login/actions";
import IndicadorSocial from "@/app/components/social/indicador";

const NAV_LINKS = [
  { label: "Música", href: "/musica" },
  { label: "Gêneros", href: "/generos" },
  { label: "Membros", href: "/membros" },
  { label: "Pro", href: "/pro", highlight: true },
];

type UsuarioHeader = { username: string; avatar: string | null; admin: boolean };

export default function Header({ usuario }: { usuario: UsuarioHeader | null }) {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mouseInside, setMouseInside] = useState(false);
  const router = useRouter();
  const navLinks = usuario?.admin ? [...NAV_LINKS, { label: "Admin", href: "/admin", highlight: false }] : NAV_LINKS;

  function handleSearchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const search = query.trim();

    if (!search) return;

    router.push(`/buscar?q=${encodeURIComponent(search)}`);
    setMenuOpen(false);
  }

  function handleMouseMove(e: MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();

    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  return (
    <header
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setMouseInside(true)}
      onMouseLeave={() => setMouseInside(false)}
      className="sticky top-0 z-50 overflow-hidden border-b border-white/10 bg-neutral-950/90 text-white shadow-lg shadow-black/10 backdrop-blur-xl"
    >
      {/* Brilho roxo que acompanha o mouse */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: mouseInside ? 1 : 0,
          background: `radial-gradient(
            300px circle at ${mousePosition.x}px ${mousePosition.y}px,
            rgba(139, 92, 246, 0.20),
            rgba(124, 58, 237, 0.08) 40%,
            transparent 75%
          )`,
        }}
      />

      {/* Linha roxa sutil na parte inferior */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-0 h-px"
        style={{
          background: mouseInside
            ? `radial-gradient(
                250px circle at ${mousePosition.x}px 100%,
                rgba(167, 139, 250, 0.8),
                transparent 80%
              )`
            : "transparent",
        }}
      />

      <div className="relative z-10 mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          aria-label="SoundProfile - página inicial"
          className="flex shrink-0 items-center gap-2"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-xl font-black transition hover:bg-violet-500">
            S
          </span>

          <span className="hidden text-lg font-bold tracking-tight sm:block">
            Sound<span className="text-violet-400">Profile</span>
          </span>
        </Link>

        {/* Busca */}
        <form
          onSubmit={handleSearchSubmit}
          role="search"
          className="flex min-w-0 max-w-md flex-1"
        >
          <div className="flex w-full items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 transition focus-within:border-violet-500 focus-within:bg-white/[0.07]">
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 text-neutral-400"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>

            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Artistas, álbuns, membros..."
              aria-label="Pesquisar no SoundProfile"
              className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-neutral-500"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpar pesquisa"
                className="text-neutral-400 transition hover:text-white"
              >
                ×
              </button>
            )}
          </div>
        </form>

        {/* Navegação desktop */}
        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-6 lg:flex"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                link.highlight
                  ? "font-semibold text-violet-400 transition hover:text-violet-300"
                  : "text-sm font-medium text-neutral-300 transition hover:text-white"
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Ações */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {usuario ? (
            <>
              <IndicadorSocial />
              <Link
                href={`/perfil/${usuario.username}`}
                aria-label="Meu perfil"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-white/5"
              >
                {usuario.avatar ? (
                  <img
                    src={usuario.avatar}
                    alt=""
                    className="h-8 w-8 rounded-full border border-violet-500/40 object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-sm font-bold">
                    {usuario.username[0].toUpperCase()}
                  </span>
                )}
                <span className="hidden max-w-32 truncate text-sm font-medium text-neutral-200 sm:block">
                  @{usuario.username}
                </span>
              </Link>

              <form action={sair}>
                <button
                  type="submit"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-300 transition hover:bg-white/5 hover:text-white"
                >
                  Sair
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-neutral-300 transition hover:bg-white/5 hover:text-white sm:inline-flex"
              >
                Entre
              </Link>

              <Link
                href="/cadastro"
                className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold transition hover:bg-violet-500 sm:px-4"
              >
                <span className="sm:hidden">Cadastrar</span>
                <span className="hidden sm:inline">Inscreva-se</span>
              </Link>
            </>
          )}

          {/* Menu mobile */}
          <button
            type="button"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-xl transition hover:bg-white/10 lg:hidden"
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </div>
      </div>

      {/* Menu mobile aberto */}
      {menuOpen && (
        <nav
          aria-label="Navegação mobile"
          className="relative z-10 border-t border-white/10 bg-neutral-950/95 px-4 py-3 backdrop-blur-xl lg:hidden"
        >
          <div className="mx-auto flex max-w-[1600px] flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-4 py-3 text-sm transition hover:bg-white/5 ${
                  link.highlight
                    ? "font-semibold text-violet-400"
                    : "text-neutral-300 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {!usuario && (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-4 py-3 text-sm text-neutral-300 transition hover:bg-white/5 hover:text-white sm:hidden"
            >
              Entre
            </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
