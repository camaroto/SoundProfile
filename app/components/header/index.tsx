"use client";

import { useState, FormEvent } from "react";

const NAV_LINKS = [
    { label: "Música", href: "/musica" },
    { label: "Membros", href: "/membros" },
    { label: "Listas", href: "/listas" },
    { label: "Pro", href: "/pro", highlight: true },
];

export default function Header() {
    const [query, setQuery] = useState("");

    // TODO(backend): trocar por uma chamada real de busca (artistas, álbuns, membros...)
    // ex: router.push(`/buscar?q=${encodeURIComponent(query)}`)
    function handleSearchSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!query.trim()) return;
        console.log("buscar por:", query);
    }

    return (
        <header className="bg-neutral-800 sticky top-0 z-50 flex h-16 items-center justify-between gap-6 border-b border-border/60 bg-bg/90 px-6 backdrop-blur-md">
            {/* Logo */}
            <a href="/" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
                <span className="text-lg font-bold text-accent-light">S</span>
            </a>

            {/* Busca */}
            <form onSubmit={handleSearchSubmit} className="flex max-w-xs flex-1 items-center">
                <div className="flex w-full items-center gap-2 rounded-full border-violet-500 border border-border bg-panel px-3 py-1.5">
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="shrink-0 text-white"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                    </svg>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Pesquisar"
                        className="w-full bg-transparent text-sm placeholder:font-bold placeholder:text-neutral-500 focus:outline-none"
                    />
                </div>
            </form>

            {/* Navegação central */}
            <nav className="hidden items-center gap-7 text-sm font-medium text-neutral-300 md:flex">
                {NAV_LINKS.map((link) => (
                    <a
                        key={link.label}
                        href={link.href}
                        className={
                            link.highlight
                                ? "text-accent-light transition hover:text-white"
                                : "transition hover:text-white"
                        }
                    >
                        {link.label}
                    </a>
                ))}
                <button
                    aria-label="Mais opções"
                    className="font-bold text-white transition hover:text-neutral-500"
                >
                    ···
                </button>
            </nav>

            {/* Ações */}
            <div className="flex shrink-0 items-center gap-3">
                <a
                    href="/entrar"
                    className="rounded-full text-white bg-neutral-700 px-4 py-1.5 text-sm font-medium transition hover:bg-neutral-600"
                >
                    Conecte-se
                </a>
                <a
                    href="/cadastro"
                    className="rounded-full bg-accent-gradient px-4 py-1.5 text-sm font-semibold bg-violet-500 text-white shadow-[0_0_20px_-4px_rgba(139,63,251,0.7)] transition hover:brightness-110"
                >
                    Inscreva-se
                </a>
            </div>
        </header>
    );
}