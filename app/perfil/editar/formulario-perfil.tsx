"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { salvarPerfil, type EstadoPerfil } from "./actions";

const LIMITE_BYTES = 2 * 1024 * 1024;

const campo =
  "w-full rounded-lg border bg-neutral-800 p-3 text-white outline-none transition placeholder:text-neutral-500 focus:ring-2";
const borda = (erro?: string) =>
  erro
    ? "border-red-500/70 focus:border-red-500 focus:ring-red-500/30"
    : "border-white/10 focus:border-purple-500 focus:ring-purple-500/30";

function Erro({ id, texto }: { id: string; texto?: string }) {
  return texto ? (
    <p id={id} role="alert" className="mt-2 text-xs text-red-400">
      {texto}
    </p>
  ) : null;
}

function SeletorImagem({
  nome,
  rotulo,
  tipo,
  atual,
  erro,
}: {
  nome: "avatar" | "banner";
  rotulo: string;
  tipo: "avatar" | "banner";
  atual: string | null;
  erro?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previa, setPrevia] = useState<string | null>(null);
  const [remover, setRemover] = useState(false);
  const [erroLocal, setErroLocal] = useState("");

  // Depois de uma tentativa com erro o React limpa o formulário; a prévia
  // precisa acompanhar, senão mostraria uma imagem que não será enviada.
  useEffect(() => {
    const form = inputRef.current?.form;
    const limpar = () => {
      setPrevia(null);
      setRemover(false);
      setErroLocal("");
    };
    form?.addEventListener("reset", limpar);
    return () => form?.removeEventListener("reset", limpar);
  }, []);

  useEffect(() => {
    return () => {
      if (previa) URL.revokeObjectURL(previa);
    };
  }, [previa]);

  function aoEscolher(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    setErroLocal("");

    if (!arquivo) {
      setPrevia(null);
      return;
    }
    if (arquivo.size > LIMITE_BYTES) {
      e.target.value = "";
      setPrevia(null);
      setErroLocal("Arquivo muito grande. O limite é 2 MB.");
      return;
    }
    setRemover(false);
    setPrevia(URL.createObjectURL(arquivo));
  }

  const imagem = previa ?? (remover ? null : atual);
  const idErro = `${nome}-erro`;
  const mensagem = erroLocal || erro;

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-white">{rotulo}</p>

      <div
        className={`relative overflow-hidden border border-white/10 bg-gradient-to-br from-violet-950 via-[#171020] to-fuchsia-950 ${
          tipo === "banner" ? "h-40 rounded-xl" : "h-28 w-28 rounded-[25px]"
        }`}
      >
        {imagem && (
          <img src={imagem} alt={`Prévia de ${rotulo.toLowerCase()}`} className="h-full w-full object-cover" />
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        name={nome}
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={aoEscolher}
        aria-label={`Escolher ${rotulo.toLowerCase()}`}
        aria-invalid={mensagem ? true : undefined}
        aria-describedby={mensagem ? idErro : undefined}
        className="mt-3 block w-full text-sm text-white/60 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-violet-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-violet-500"
      />
      <p className="mt-1 text-xs text-white/35">JPG, PNG, WebP ou GIF animado, até 2 MB.</p>

      {atual && !previa && (
        <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-white/60">
          <input
            type="checkbox"
            name={`remover_${nome}`}
            checked={remover}
            onChange={(e) => setRemover(e.target.checked)}
            className="h-4 w-4 accent-violet-500"
          />
          Remover imagem atual
        </label>
      )}

      <Erro id={idErro} texto={mensagem} />
    </div>
  );
}

export default function FormularioPerfil({
  username,
  inicial,
  avatarAtual,
  bannerAtual,
}: {
  username: string;
  inicial: EstadoPerfil["valores"];
  avatarAtual: string | null;
  bannerAtual: string | null;
}) {
  const [estado, formAction, pendente] = useActionState(salvarPerfil, {
    erros: {},
    valores: inicial,
  } as EstadoPerfil);
  const [tamanhoBio, setTamanhoBio] = useState(inicial.biografia.length);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-7">
      {estado.erroGeral && (
        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {estado.erroGeral}
        </p>
      )}

      <SeletorImagem nome="banner" rotulo="Banner" tipo="banner" atual={bannerAtual} erro={estado.erros.banner} />
      <SeletorImagem nome="avatar" rotulo="Foto de perfil" tipo="avatar" atual={avatarAtual} erro={estado.erros.avatar} />

      <div>
        <label htmlFor="nomeExibicao" className="mb-2 block text-sm font-medium text-white">
          Nome de exibição
        </label>
        <input
          id="nomeExibicao"
          name="nomeExibicao"
          defaultValue={estado.valores.nomeExibicao}
          maxLength={40}
          placeholder={username}
          aria-invalid={estado.erros.nomeExibicao ? true : undefined}
          aria-describedby="nomeExibicao-erro"
          className={`${campo} ${borda(estado.erros.nomeExibicao)}`}
        />
        <Erro id="nomeExibicao-erro" texto={estado.erros.nomeExibicao} />
      </div>

      <div>
        <label htmlFor="localizacao" className="mb-2 block text-sm font-medium text-white">
          Localização
        </label>
        <input
          id="localizacao"
          name="localizacao"
          defaultValue={estado.valores.localizacao}
          maxLength={60}
          placeholder="Cidade, estado"
          aria-invalid={estado.erros.localizacao ? true : undefined}
          aria-describedby="localizacao-erro"
          className={`${campo} ${borda(estado.erros.localizacao)}`}
        />
        <Erro id="localizacao-erro" texto={estado.erros.localizacao} />
      </div>

      <div>
        <label htmlFor="biografia" className="mb-2 block text-sm font-medium text-white">
          Biografia
        </label>
        <textarea
          id="biografia"
          name="biografia"
          defaultValue={estado.valores.biografia}
          onChange={(e) => setTamanhoBio(e.target.value.length)}
          maxLength={300}
          rows={4}
          placeholder="Conte um pouco sobre o seu gosto musical"
          aria-invalid={estado.erros.biografia ? true : undefined}
          aria-describedby="biografia-erro"
          className={`${campo} resize-none ${borda(estado.erros.biografia)}`}
        />
        <div className="flex justify-between">
          <Erro id="biografia-erro" texto={estado.erros.biografia} />
          <span className="ml-auto mt-1 text-xs text-white/30">{tamanhoBio}/300</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pendente}
          className="rounded-lg bg-purple-600 px-6 py-3 font-bold text-white transition hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendente ? "Salvando..." : "Salvar alterações"}
        </button>
        <Link
          href={`/perfil/${username}`}
          className="rounded-lg border border-white/10 px-6 py-3 font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
