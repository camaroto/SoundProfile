"use client";

import { useActionState, useRef, useEffect } from "react";
import { criarAlbumAction, criarArtistaAction, criarMusicaAction, excluirItemAction, type EstadoAdmin } from "./actions";

const campo =
  "w-full rounded-lg border border-white/10 bg-neutral-800 p-3 text-white outline-none transition placeholder:text-neutral-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30";
const botao =
  "rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 disabled:cursor-not-allowed disabled:opacity-50";

type Opcao = { id: number; nome: string };

function Rotulo({ id, children }: { id: string; children: React.ReactNode }) {
  return <label htmlFor={id} className="mb-2 block text-sm font-medium">{children}</label>;
}

function Cartao({ titulo, children, estado, pendente, acao }: {
  titulo: string; children: React.ReactNode; estado: EstadoAdmin; pendente: boolean;
  acao: (fd: FormData) => void;
}) {
  const ref = useRef<HTMLFormElement>(null);
  // Limpa os campos depois de um cadastro bem-sucedido.
  useEffect(() => { if (estado.ok) ref.current?.reset(); }, [estado]);

  return (
    <form ref={ref} action={acao} className="min-w-0 space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
      <h2 className="text-lg font-semibold">{titulo}</h2>
      {children}
      {estado.erro && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{estado.erro}</p>}
      {estado.ok && <p role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">{estado.ok}</p>}
      <button type="submit" disabled={pendente} className={botao}>{pendente ? "Salvando..." : "Cadastrar"}</button>
    </form>
  );
}

const arquivo = "block w-full text-sm text-white/60 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-violet-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-violet-500";

export function FormArtista({ generos }: { generos: Opcao[] }) {
  const [estado, acao, pendente] = useActionState<EstadoAdmin, FormData>(criarArtistaAction, {});
  return (
    <Cartao titulo="Novo artista" estado={estado} pendente={pendente} acao={acao}>
      <div><Rotulo id="a-nome">Nome</Rotulo><input id="a-nome" name="nome" required maxLength={100} className={campo} /></div>
      <div><Rotulo id="a-bio">Biografia (opcional)</Rotulo><textarea id="a-bio" name="biografia" rows={3} maxLength={1500} className={`${campo} resize-none`} /></div>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Gêneros</legend>
        <div className="flex flex-wrap gap-2">
          {generos.map((g) => (
            <label key={g.id} className="flex cursor-pointer items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-sm has-[:checked]:border-violet-400/50 has-[:checked]:bg-violet-500/15">
              <input type="checkbox" name="generos" value={g.id} className="accent-violet-500" />
              {g.nome}
            </label>
          ))}
        </div>
      </fieldset>
      <div><Rotulo id="a-img">Foto (opcional, JPG/PNG/WebP até 2 MB)</Rotulo><input id="a-img" name="imagem" type="file" accept="image/jpeg,image/png,image/webp" className={arquivo} /></div>
    </Cartao>
  );
}

export function FormAlbum({ artistas }: { artistas: Opcao[] }) {
  const [estado, acao, pendente] = useActionState<EstadoAdmin, FormData>(criarAlbumAction, {});
  return (
    <Cartao titulo="Novo álbum" estado={estado} pendente={pendente} acao={acao}>
      <div><Rotulo id="al-t">Título</Rotulo><input id="al-t" name="titulo" required maxLength={150} className={campo} /></div>
      <div>
        <Rotulo id="al-a">Artista</Rotulo>
        <select id="al-a" name="idArtista" required className={campo} defaultValue="">
          <option value="" disabled>{artistas.length ? "Escolha..." : "Cadastre um artista primeiro"}</option>
          {artistas.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
        </select>
      </div>
      <div><Rotulo id="al-ano">Ano (opcional)</Rotulo><input id="al-ano" name="ano" type="number" min={1900} max={2100} className={campo} /></div>
      <div><Rotulo id="al-c">Capa (opcional, JPG/PNG/WebP até 2 MB)</Rotulo><input id="al-c" name="capa" type="file" accept="image/jpeg,image/png,image/webp" className={arquivo} /></div>
    </Cartao>
  );
}

export function FormMusica({ artistas, albuns }: { artistas: Opcao[]; albuns: { id: number; titulo: string; artista: string }[] }) {
  const [estado, acao, pendente] = useActionState<EstadoAdmin, FormData>(criarMusicaAction, {});
  return (
    <Cartao titulo="Nova música" estado={estado} pendente={pendente} acao={acao}>
      <div><Rotulo id="m-t">Título</Rotulo><input id="m-t" name="titulo" required maxLength={150} className={campo} /></div>
      <div>
        <Rotulo id="m-a">Artista</Rotulo>
        <select id="m-a" name="idArtista" required className={campo} defaultValue="">
          <option value="" disabled>{artistas.length ? "Escolha..." : "Cadastre um artista primeiro"}</option>
          {artistas.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
        </select>
      </div>
      <div>
        <Rotulo id="m-al">Álbum (opcional, do mesmo artista)</Rotulo>
        <select id="m-al" name="idAlbum" className={campo} defaultValue="">
          <option value="">Single, sem álbum</option>
          {albuns.map((a) => <option key={a.id} value={a.id}>{a.artista}: {a.titulo}</option>)}
        </select>
      </div>
      <div><Rotulo id="m-f">Número da faixa (opcional)</Rotulo><input id="m-f" name="faixa" type="number" min={1} max={500} className={campo} /></div>
    </Cartao>
  );
}

export function BotaoExcluir({ tipo, id, nome }: { tipo: string; id: number; nome: string }) {
  return (
    <form
      action={excluirItemAction}
      onSubmit={(e) => {
        if (!window.confirm(`Excluir “${nome}”? As avaliações e favoritos ligados a este item também serão apagados.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="tipo" value={tipo} />
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="rounded-lg px-3 py-1.5 text-xs text-red-300/80 transition hover:bg-red-500/10">Excluir</button>
    </form>
  );
}
