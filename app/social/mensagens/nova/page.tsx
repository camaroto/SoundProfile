import { exigirLogin } from "@/lib/sessao";
import { buscarUsuarios, listarSeguindo, type UsuarioSocial } from "@/lib/seguidores";
import ShellSocial from "@/app/components/social/shell";
import Avatar from "@/app/components/social/avatar";
import { BotaoMensagem } from "@/app/components/social/acoes-seguir";
import { IconeBusca } from "@/app/components/social/icones";
import { EstadoVazio } from "@/app/components/ui";

type Props = { searchParams: Promise<{ q?: string }> };

function Linha({ u }: { u: UsuarioSocial }) {
  const nome = u.nomeExibicao || u.username;
  return (
    <li className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3">
      <Avatar src={u.avatar} nome={nome} className="h-11 w-11" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{nome}</span>
        <span className="block truncate text-sm text-white/40">@{u.username}</span>
      </span>
      <BotaoMensagem idUsuario={u.idUsuario} />
    </li>
  );
}

export default async function NovaConversaPage({ searchParams }: Props) {
  const eu = await exigirLogin();
  const q = ((await searchParams).q ?? "").trim().slice(0, 60);
  const [seguindo, resultados] = await Promise.all([listarSeguindo(eu.idUsuario, q), q ? buscarUsuarios(eu.idUsuario, q) : Promise.resolve([])]);

  return (
    <ShellSocial idUsuario={eu.idUsuario} ativo="mensagens">
      <div className="p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Nova conversa</h1>
        <form role="search" className="mb-6 mt-4 flex max-w-xl gap-2">
          <label htmlFor="busca-nova" className="sr-only">Buscar pessoas</label>
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-neutral-800 px-3 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/30">
            <IconeBusca className="h-4 w-4 shrink-0 text-white/40" />
            <input id="busca-nova" name="q" type="search" defaultValue={q} placeholder="Buscar por nome ou nome de usuário" className="w-full min-w-0 bg-transparent py-3 text-white outline-none placeholder:text-neutral-500" />
          </div>
          <button type="submit" className="rounded-lg bg-violet-600 px-5 text-sm font-semibold transition hover:bg-violet-500">Buscar</button>
        </form>

        {q && (
          <section className="mb-8" aria-labelledby="t-res">
            <h2 id="t-res" className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/45">Resultados</h2>
            {resultados.length === 0 ? <EstadoVazio titulo="Ninguém encontrado" texto={`Não achamos ninguém para “${q}”.`} /> : <ul className="space-y-2">{resultados.map((u) => <Linha key={u.idUsuario} u={u} />)}</ul>}
          </section>
        )}

        <section aria-labelledby="t-seguindo">
          <h2 id="t-seguindo" className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/45">Quem você segue</h2>
          {seguindo.length === 0 ? (
            <EstadoVazio titulo={q ? "Ninguém com esse nome entre quem você segue" : "Você ainda não segue ninguém"} texto="Você pode conversar com qualquer membro: use a busca acima." />
          ) : (
            <ul className="space-y-2">{seguindo.map((u) => <Linha key={u.idUsuario} u={u} />)}</ul>
          )}
        </section>
      </div>
    </ShellSocial>
  );
}
