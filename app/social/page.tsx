import Link from "next/link";
import { exigirLogin } from "@/lib/sessao";
import { buscarUsuarios, contagens, listarSeguidores, listarSeguindo, type Pessoa } from "@/lib/seguidores";
import ShellSocial from "@/app/components/social/shell";
import Avatar from "@/app/components/social/avatar";
import { AcoesSeguir, BotaoMensagem } from "@/app/components/social/acoes-seguir";
import { IconeBusca } from "@/app/components/social/icones";
import { EstadoVazio } from "@/app/components/ui";

type Props = { searchParams: Promise<{ aba?: string; q?: string }> };

const ABAS = ["seguindo", "seguidores", "descobrir"] as const;

function Linha({ p }: { p: Pessoa }) {
  const nome = p.nomeExibicao || p.username;
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 sm:flex-nowrap">
      <Link href={`/perfil/${p.username}`} className="flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">
        <Avatar src={p.avatar} nome={nome} className="h-11 w-11" />
        <span className="min-w-0">
          <span className="block truncate font-medium">{nome}</span>
          <span className="block truncate text-sm text-white/40">@{p.username}</span>
        </span>
      </Link>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <AcoesSeguir seguindo={p.seguindo} meSegue={p.meSegue} idUsuario={p.idUsuario} nome={nome} />
        <BotaoMensagem idUsuario={p.idUsuario} compacto />
      </div>
    </li>
  );
}

function FormBusca({ aba, q, placeholder }: { aba: string; q: string; placeholder: string }) {
  return (
    <form role="search" className="mb-5 flex max-w-xl gap-2">
      <input type="hidden" name="aba" value={aba} />
      <label htmlFor="busca-social" className="sr-only">{placeholder}</label>
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-neutral-800 px-3 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/30">
        <IconeBusca className="h-4 w-4 shrink-0 text-white/40" />
        <input id="busca-social" name="q" type="search" defaultValue={q} placeholder={placeholder} className="w-full min-w-0 bg-transparent py-3 text-white outline-none placeholder:text-neutral-500" />
      </div>
      <button type="submit" className="rounded-lg bg-violet-600 px-5 text-sm font-semibold transition hover:bg-violet-500">Buscar</button>
    </form>
  );
}

export default async function SocialPage({ searchParams }: Props) {
  const eu = await exigirLogin();
  const sp = await searchParams;
  const aba = ABAS.find((a) => a === sp.aba) ?? "seguindo";
  const q = (sp.q ?? "").trim().slice(0, 60);

  const [rede, pessoas] = await Promise.all([
    contagens(eu.idUsuario),
    aba === "seguindo" ? listarSeguindo(eu.idUsuario, q)
      : aba === "seguidores" ? listarSeguidores(eu.idUsuario, q)
      : buscarUsuarios(eu.idUsuario, q),
  ]);

  const rotulos = { seguindo: `Seguindo (${rede.seguindo})`, seguidores: `Seguidores (${rede.seguidores})`, descobrir: "Descobrir pessoas" };

  return (
    <ShellSocial idUsuario={eu.idUsuario} ativo="amigos">
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Pessoas</h1>

        <nav aria-label="Pessoas" className="mb-6 mt-4 flex flex-wrap gap-2">
          {ABAS.map((a) => (
            <Link
              key={a}
              href={`/social?aba=${a}`}
              aria-current={aba === a ? "page" : undefined}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${aba === a ? "bg-violet-500/20 text-white" : "text-white/55 hover:bg-white/5 hover:text-white"}`}
            >
              {rotulos[a]}
            </Link>
          ))}
        </nav>

        <FormBusca
          aba={aba}
          q={q}
          placeholder={aba === "descobrir" ? "Nome ou nome de usuário" : aba === "seguindo" ? "Buscar em quem você segue" : "Buscar nos seus seguidores"}
        />

        {aba === "descobrir" && !q ? (
          <p className="text-sm text-white/40">Digite um nome ou nome de usuário para encontrar pessoas e seguir.</p>
        ) : pessoas.length === 0 ? (
          aba === "seguindo" ? (
            <EstadoVazio
              titulo={q ? "Ninguém encontrado" : "Você ainda não segue ninguém"}
              texto={q ? "Tente outro nome ou nome de usuário." : "Procure pessoas pelo nome ou nome de usuário e comece a seguir."}
              acao={q ? undefined : { href: "/social?aba=descobrir", rotulo: "Descobrir pessoas" }}
            />
          ) : aba === "seguidores" ? (
            <EstadoVazio titulo={q ? "Ninguém encontrado" : "Ainda não há seguidores"} texto={q ? "Tente outro nome." : "Quando alguém começar a seguir você, aparece aqui."} />
          ) : (
            <EstadoVazio titulo="Ninguém encontrado" texto={`Não achamos ninguém para “${q}”. Confira a grafia e tente de novo.`} />
          )
        ) : (
          <ul className="space-y-2">{pessoas.map((p) => <Linha key={p.idUsuario} p={p} />)}</ul>
        )}
      </div>
    </ShellSocial>
  );
}
