"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { salvarPerfil, type EstadoPerfil } from "./actions";
import PalcoPerfil from "@/app/components/moldura/palco-perfil";
import BalaoPerfil from "@/app/components/moldura/balao";
import { BALOES, MOLDURAS, type IdBalao, type IdMoldura } from "@/lib/molduras";

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
  aoMudar,
}: {
  nome: "avatar" | "banner";
  rotulo: string;
  tipo: "avatar" | "banner";
  atual: string | null;
  erro?: string;
  // Avisa o formulário qual imagem está sendo mostrada (para a prévia da moldura).
  aoMudar?: (url: string | null) => void;
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
      aoMudar?.(atual);
    };
    form?.addEventListener("reset", limpar);
    return () => form?.removeEventListener("reset", limpar);
  }, [atual, aoMudar]);

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
      aoMudar?.(remover ? null : atual);
      return;
    }
    if (arquivo.size > LIMITE_BYTES) {
      e.target.value = "";
      setPrevia(null);
      setErroLocal("Arquivo muito grande. O limite é 2 MB.");
      aoMudar?.(remover ? null : atual);
      return;
    }
    setRemover(false);
    const url = URL.createObjectURL(arquivo);
    setPrevia(url);
    aoMudar?.(url);
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
            onChange={(e) => {
              setRemover(e.target.checked);
              aoMudar?.(e.target.checked ? null : atual);
            }}
            className="h-4 w-4 accent-violet-500"
          />
          Remover imagem atual
        </label>
      )}

      <Erro id={idErro} texto={mensagem} />
    </div>
  );
}

function Opcao({
  grupo, rotulo, descricao, marcado, aoEscolher, children,
}: {
  grupo: string;
  rotulo: string;
  descricao?: string;
  marcado: boolean;
  aoEscolher: () => void;
  children?: React.ReactNode;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition focus-within:ring-2 focus-within:ring-violet-400 ${
        marcado ? "border-violet-400 bg-violet-500/15" : "border-white/10 hover:bg-white/5"
      }`}
    >
      <input type="radio" name={grupo} checked={marcado} onChange={aoEscolher} className="sr-only" />
      {children}
      <span className="min-w-0">
        <span className="block text-sm font-medium text-white">{rotulo}</span>
        {descricao && <span className="block text-xs leading-4 text-white/45">{descricao}</span>}
      </span>
    </label>
  );
}

export default function FormularioPerfil({
  username,
  inicial,
  avatarAtual,
  bannerAtual,
  molduraAtual,
  balaoAtual,
}: {
  username: string;
  inicial: EstadoPerfil["valores"];
  avatarAtual: string | null;
  bannerAtual: string | null;
  molduraAtual: IdMoldura | null;
  balaoAtual: IdBalao | null;
}) {
  const [estado, formAction, pendente] = useActionState(salvarPerfil, {
    erros: {},
    valores: inicial,
  } as EstadoPerfil);
  const [tamanhoBio, setTamanhoBio] = useState(inicial.biografia.length);
  const [moldura, setMoldura] = useState<IdMoldura | null>(molduraAtual);
  const [balao, setBalao] = useState<IdBalao | null>(balaoAtual);
  const [bannerPrevia, setBannerPrevia] = useState<string | null>(bannerAtual);
  const [avatarPrevia, setAvatarPrevia] = useState<string | null>(avatarAtual);
  const nomePrevia = inicial.nomeExibicao || username;

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-7">
      {estado.erroGeral && (
        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {estado.erroGeral}
        </p>
      )}

      <SeletorImagem nome="banner" rotulo="Banner" tipo="banner" atual={bannerAtual} erro={estado.erros.banner} aoMudar={setBannerPrevia} />
      <SeletorImagem nome="avatar" rotulo="Foto de perfil" tipo="avatar" atual={avatarAtual} erro={estado.erros.avatar} aoMudar={setAvatarPrevia} />

      {/* Os valores enviados ao servidor. Os botões de escolha abaixo só mudam este estado. */}
      <input type="hidden" name="moldura" value={moldura ?? ""} />
      <input type="hidden" name="balao" value={balao ?? ""} />

      <fieldset className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
        <legend className="px-2 text-sm font-medium text-white">Moldura do perfil</legend>
        <p className="text-xs leading-5 text-white/45">
          Uma moldura animada envolve o banner e a sua foto. Ela aparece em telas a partir de 768 px; em telas menores o perfil continua como sempre.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Opcao grupo="molduraUi" rotulo="Nenhuma" descricao="Perfil sem moldura." marcado={moldura === null} aoEscolher={() => setMoldura(null)}>
            <span aria-hidden="true" className="h-10 w-10 shrink-0 rounded-lg border border-dashed border-white/20" />
          </Opcao>
          {MOLDURAS.map((m) => (
            <Opcao key={m.id} grupo="molduraUi" rotulo={m.nome} descricao={m.descricao} marcado={moldura === m.id} aoEscolher={() => setMoldura(m.id)}>
              <span aria-hidden="true" className={`h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br ${m.cores}`} />
            </Opcao>
          ))}
        </div>

        <div className="mt-5 hidden md:block">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">Prévia</p>
          {moldura ? (
            <div className="overflow-hidden rounded-xl border border-white/10 bg-[#08070d]">
              <PalcoPerfil key={moldura} nome={nomePrevia} banner={bannerPrevia} avatar={avatarPrevia} moldura={moldura} balao={balao} />
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-white/40">Escolha uma moldura para ver a prévia com o seu banner e a sua foto.</p>
          )}
        </div>
      </fieldset>

      <fieldset className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
        <legend className="px-2 text-sm font-medium text-white">Balão de fala</legend>
        <p className="text-xs leading-5 text-white/45">Um balão em pixel art que fica no canto da sua foto de perfil.</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Opcao grupo="balaoUi" rotulo="Nenhum" marcado={balao === null} aoEscolher={() => setBalao(null)} />
          {BALOES.map((b) => (
            <Opcao key={b.id} grupo="balaoUi" rotulo={b.nome} descricao={b.animado ? "Animado" : undefined} marcado={balao === b.id} aoEscolher={() => setBalao(b.id)} />
          ))}
        </div>

        {balao && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">Prévia</p>
            <div className="flex">
              <div className="relative mt-[72px] h-24 w-24 shrink-0 overflow-visible">
                <div className="h-full w-full overflow-hidden rounded-[25px] border border-white/20 bg-[#171020] p-1">
                  {avatarPrevia ? (
                    <img src={avatarPrevia} alt="Prévia da foto de perfil" className="h-full w-full rounded-[21px] object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-[21px] bg-gradient-to-br from-violet-950 via-[#171020] to-fuchsia-950 text-3xl font-semibold text-violet-300">
                      {nomePrevia[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <BalaoPerfil tipo={balao} className="absolute left-[78%] top-[6%] -translate-y-full" />
              </div>
            </div>
          </div>
        )}
      </fieldset>

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
