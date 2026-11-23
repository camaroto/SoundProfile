import Link from "next/link";

const ABAS = [
  { id: "perfil", href: "/perfil/editar", rotulo: "Perfil" },
  { id: "personalizacao", href: "/perfil/personalizar", rotulo: "Personalização" },
] as const;

// Abas das configurações do perfil: "Perfil" (textos) e "Personalização" (visual).
export default function AbasPerfil({ ativa }: { ativa: (typeof ABAS)[number]["id"] }) {
  return (
    <nav aria-label="Configurações do perfil" className="mt-6 flex gap-1 border-b border-white/10">
      {ABAS.map((a) => (
        <Link
          key={a.id}
          href={a.href}
          aria-current={ativa === a.id ? "page" : undefined}
          className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
            ativa === a.id ? "border-violet-400 text-white" : "border-transparent text-white/50 hover:text-white"
          }`}
        >
          {a.rotulo}
        </Link>
      ))}
    </nav>
  );
}
