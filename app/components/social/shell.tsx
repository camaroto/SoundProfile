import Link from "next/link";
import { listarConversas } from "@/lib/mensagens";
import { contarNotificacoesNaoLidas } from "@/lib/notificacoes";
import ListaConversas from "./lista-conversas";
import { IconeAmigos, IconeChat, IconeSino } from "./icones";

export type SecaoSocial = "amigos" | "mensagens" | "notificacoes";

function Selo({ n }: { n: number }) {
  if (n <= 0) return null;
  return <span className="ml-auto min-w-[20px] rounded-full bg-violet-500 px-1.5 text-center text-[11px] font-bold leading-5">{n > 99 ? "99+" : n}</span>;
}

// Estrutura da área Social: navegação + conversas à esquerda, conteúdo à direita.
// No celular, mostra só a lista (menuMobile) ou só o conteúdo, com abas no topo.
export default async function ShellSocial({
  idUsuario, ativo, conversaAtiva, q, menuMobile = false, semAbasMobile = false, children,
}: {
  idUsuario: number;
  ativo: SecaoSocial;
  conversaAtiva?: number;
  q?: string;
  menuMobile?: boolean;
  semAbasMobile?: boolean;
  children: React.ReactNode;
}) {
  const [conversas, notificacoes] = await Promise.all([listarConversas(idUsuario, q), contarNotificacoesNaoLidas(idUsuario)]);
  const mensagensNaoLidas = conversas.reduce((t, c) => t + c.naoLidas, 0);

  const itens = [
    { id: "amigos" as const, href: "/social", rotulo: "Pessoas", Icone: IconeAmigos, n: 0 },
    { id: "mensagens" as const, href: "/social/mensagens", rotulo: "Mensagens", Icone: IconeChat, n: mensagensNaoLidas },
    { id: "notificacoes" as const, href: "/social/notificacoes", rotulo: "Notificações", Icone: IconeSino, n: notificacoes },
  ];

  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-[#09090b] text-white">
      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside
          aria-label="Navegação social"
          className={`${menuMobile ? "flex" : "hidden"} flex-col border-white/10 bg-[#0c0b12] lg:sticky lg:top-16 lg:flex lg:h-[calc(100dvh-4rem)] lg:border-r`}
        >
          <nav className="space-y-0.5 p-2 pt-3">
            {itens.map(({ id, href, rotulo, Icone, n }) => (
              <Link
                key={id}
                href={href}
                aria-current={ativo === id && !conversaAtiva ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${
                  ativo === id && !conversaAtiva ? "bg-violet-500/20 text-white" : "text-white/65 hover:bg-white/[0.06] hover:text-white"
                } ${id === "mensagens" ? "lg:hidden" : ""}`}
              >
                <Icone className="h-5 w-5" />
                {rotulo}
                <Selo n={n} />
              </Link>
            ))}
          </nav>
          <ListaConversas conversas={conversas} ativa={conversaAtiva} q={q} />
        </aside>

        <section className={`${menuMobile ? "hidden" : "block"} min-w-0 lg:block`}>
          {!menuMobile && !semAbasMobile && (
            <nav aria-label="Seções sociais" className="flex gap-1 overflow-x-auto border-b border-white/10 px-3 py-2 lg:hidden">
              {itens.map(({ id, href, rotulo, n }) => (
                <Link
                  key={id}
                  href={href}
                  aria-current={ativo === id ? "page" : undefined}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${ativo === id ? "bg-violet-500/20 text-white" : "text-white/55"}`}
                >
                  {rotulo}
                  {n > 0 && <span className="rounded-full bg-violet-500 px-1.5 text-[11px] font-bold leading-5">{n > 99 ? "99+" : n}</span>}
                </Link>
              ))}
            </nav>
          )}
          {children}
        </section>
      </div>
    </main>
  );
}
