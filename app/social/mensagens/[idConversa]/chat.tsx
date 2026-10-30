"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import Avatar from "@/app/components/social/avatar";
import { IconeEnviar, IconeFechar, IconeMais3, IconeSorriso, IconeVoltar } from "@/app/components/social/icones";
import { enviarMensagemAction, limparConversaAction, marcarLidaAction } from "@/app/social/actions";
import { MAX_TEXTO_MENSAGEM, type MensagemDto } from "@/lib/mensagens-tipos";

type Local = MensagemDto & { chave: string; status?: "enviando" | "erro"; erro?: string };

type Props = {
  idConversa: number;
  euId: number;
  outro: { idUsuario: number; nome: string; username: string; avatar: string | null; ativo: boolean };
  iniciais: MensagemDto[];
  temMaisInicial: boolean;
  painel: React.ReactNode;
};

const EMOJIS = ["😀", "😂", "😍", "🥰", "😎", "🤔", "😭", "😅", "🙏", "👍", "👏", "🔥", "💜", "❤️", "✨", "🎧", "🎵", "🎶", "🎸", "🎹", "🥁", "🎤", "🎷", "🎺", "🎻", "📀", "💿", "🪩", "🌙", "⭐", "🌈", "🎉", "😴", "🤯", "🥹", "😤", "👀", "💯", "🙌", "🫶"];

// Horário de Brasília nos dois lados (servidor e navegador), para a tela não "piscar" ao carregar.
const FUSO = "America/Sao_Paulo";
const fmtHora = new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, hour: "2-digit", minute: "2-digit" });
const fmtDia = new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, day: "numeric", month: "long", year: "numeric" });

const ehTemporaria = (m: Local) => m.idMensagem <= 0;
const ordenar = (reais: Local[], temps: Local[]) => [...reais.sort((a, b) => a.idMensagem - b.idMensagem), ...temps];

// Junta mensagens do servidor sem duplicar o que já está na tela.
function mesclar(prev: Local[], novas: MensagemDto[]): Local[] {
  const existentes = new Set(prev.filter((m) => !ehTemporaria(m)).map((m) => m.idMensagem));
  const add = novas.filter((m) => !existentes.has(m.idMensagem)).map((m): Local => ({ ...m, chave: `m-${m.idMensagem}` }));
  if (add.length === 0) return prev;
  return ordenar([...prev.filter((m) => !ehTemporaria(m)), ...add], prev.filter(ehTemporaria));
}

// Troca a mensagem "enviando" pela versão confirmada pelo servidor.
function confirmar(prev: Local[], chave: string, real: MensagemDto): Local[] {
  const sem = prev.filter((m) => m.chave !== chave);
  if (sem.some((m) => m.idMensagem === real.idMensagem)) return sem;
  return ordenar([...sem.filter((m) => !ehTemporaria(m)), { ...real, chave }], sem.filter(ehTemporaria));
}

export default function ChatCliente({ idConversa, euId, outro, iniciais, temMaisInicial, painel }: Props) {
  const [msgs, setMsgs] = useState<Local[]>(() => iniciais.map((m) => ({ ...m, chave: `m-${m.idMensagem}` })));
  const [temMais, setTemMais] = useState(temMaisInicial);
  const [carregando, setCarregando] = useState(false);
  const [erroAnteriores, setErroAnteriores] = useState(false);
  const [semConexao, setSemConexao] = useState(false);
  const [texto, setTexto] = useState("");
  const [emojis, setEmojis] = useState(false);
  const [painelAberto, setPainelAberto] = useState(false);

  const rolagemRef = useRef<HTMLDivElement>(null);
  const campoRef = useRef<HTMLTextAreaElement>(null);
  const seguirFimRef = useRef(true);
  const ajusteRef = useRef<number | null>(null);
  const ultimoIdRef = useRef(0);
  const contadorRef = useRef(0);

  // Guarda o id da última mensagem confirmada (a atualização automática pede só o que veio depois).
  useEffect(() => {
    ultimoIdRef.current = msgs.reduce((mx, m) => (m.idMensagem > mx ? m.idMensagem : mx), 0);
  }, [msgs]);

  // Mantém a rolagem no fim (quando o usuário já estava lá) ou preserva a posição ao carregar mensagens antigas.
  useLayoutEffect(() => {
    const el = rolagemRef.current;
    if (!el) return;
    if (ajusteRef.current !== null) {
      el.scrollTop = el.scrollHeight - ajusteRef.current;
      ajusteRef.current = null;
    } else if (seguirFimRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [msgs]);

  // Atualização automática: consulta mensagens novas a cada 4 s enquanto a aba está visível.
  useEffect(() => {
    let ativo = true;

    async function buscar() {
      if (document.visibilityState !== "visible") return;
      try {
        const r = await fetch(`/api/social/conversas/${idConversa}/mensagens?depois=${ultimoIdRef.current}`, { cache: "no-store" });
        if (!r.ok) throw new Error(String(r.status));
        const dados = (await r.json()) as { mensagens: MensagemDto[] };
        if (!ativo) return;
        setSemConexao(false);
        if (dados.mensagens.length > 0) {
          const el = rolagemRef.current;
          if (el) seguirFimRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
          setMsgs((prev) => mesclar(prev, dados.mensagens));
          if (dados.mensagens.some((m) => m.idAutor !== euId)) void marcarLidaAction(idConversa);
        }
      } catch {
        if (ativo) setSemConexao(true);
      }
    }

    const timer = setInterval(buscar, 4000);
    const aoVoltar = () => void buscar();
    document.addEventListener("visibilitychange", aoVoltar);
    return () => {
      ativo = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", aoVoltar);
    };
  }, [idConversa, euId]);

  // Esc fecha o painel de perfil.
  useEffect(() => {
    if (!painelAberto) return;
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && setPainelAberto(false);
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [painelAberto]);

  async function enviar(conteudo: string, chaveExistente?: string) {
    const limpo = conteudo.trim();
    if (!limpo) return;
    if (!chaveExistente) contadorRef.current += 1;
    const chave = chaveExistente ?? `t-${contadorRef.current}`;
    const idTemp = -Number(chave.slice(2));

    seguirFimRef.current = true;
    setMsgs((prev) => [
      ...prev.filter((m) => m.chave !== chave),
      { idMensagem: idTemp, idAutor: euId, texto: limpo, enviadaEm: new Date().toISOString(), chave, status: "enviando" },
    ]);

    try {
      const r = await enviarMensagemAction(idConversa, limpo);
      if (r.ok) setMsgs((prev) => confirmar(prev, chave, r.mensagem));
      else setMsgs((prev) => prev.map((m) => (m.chave === chave ? { ...m, status: "erro", erro: r.erro } : m)));
    } catch {
      setMsgs((prev) => prev.map((m) => (m.chave === chave ? { ...m, status: "erro", erro: "Sem conexão. Tente novamente." } : m)));
    }
  }

  function aoEnviar() {
    if (!texto.trim()) return;
    const conteudo = texto;
    setTexto("");
    setEmojis(false);
    if (campoRef.current) campoRef.current.style.height = "auto";
    void enviar(conteudo);
    campoRef.current?.focus();
  }

  function inserirEmoji(emoji: string) {
    const campo = campoRef.current;
    if (!campo) return setTexto((t) => t + emoji);
    const ini = campo.selectionStart ?? texto.length;
    const fim = campo.selectionEnd ?? texto.length;
    setTexto(texto.slice(0, ini) + emoji + texto.slice(fim));
    requestAnimationFrame(() => {
      campo.focus();
      const pos = ini + emoji.length;
      campo.setSelectionRange(pos, pos);
    });
  }

  async function carregarAnteriores() {
    const primeiro = msgs.find((m) => !ehTemporaria(m))?.idMensagem;
    if (!primeiro) return;
    setCarregando(true);
    setErroAnteriores(false);
    try {
      const r = await fetch(`/api/social/conversas/${idConversa}/mensagens?antes=${primeiro}`, { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      const dados = (await r.json()) as { mensagens: MensagemDto[]; temMais: boolean };
      const el = rolagemRef.current;
      if (el) ajusteRef.current = el.scrollHeight - el.scrollTop;
      seguirFimRef.current = false;
      setMsgs((prev) => mesclar(prev, dados.mensagens));
      setTemMais(dados.temMais);
    } catch {
      setErroAnteriores(true);
    } finally {
      setCarregando(false);
    }
  }

  const restantes = MAX_TEXTO_MENSAGEM - Array.from(texto).length;

  return (
    <div className="flex h-[calc(100dvh-4rem)] min-w-0">
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Cabeçalho: avatar, nome e acesso ao perfil */}
        <header className="flex items-center gap-3 border-b border-white/10 bg-[#0c0b12] px-3 py-3 sm:px-4">
          <Link href="/social/mensagens" aria-label="Voltar para as conversas" className="rounded-lg p-2 text-white/70 hover:bg-white/10 lg:hidden">
            <IconeVoltar className="h-5 w-5" />
          </Link>
          <button
            type="button"
            onClick={() => setPainelAberto((v) => !v)}
            aria-expanded={painelAberto}
            aria-controls="painel-perfil"
            className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1 py-1 text-left transition hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            <Avatar src={outro.avatar} nome={outro.nome} className="h-10 w-10" />
            <span className="min-w-0">
              <span className="block truncate font-semibold">{outro.nome}</span>
              <span className="block truncate text-xs text-white/45">@{outro.username} · ver perfil</span>
            </span>
          </button>

          <details className="relative">
            <summary aria-label="Mais opções da conversa" className="cursor-pointer list-none rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">
              <IconeMais3 className="h-5 w-5" />
            </summary>
            <div className="absolute right-0 z-30 mt-2 w-72 rounded-xl border border-white/10 bg-[#14121c] p-3 shadow-2xl shadow-black/60">
              <p className="text-sm leading-5 text-white/70">Apagar esta conversa da sua lista? O histórico do outro usuário não é apagado.</p>
              <form action={limparConversaAction} className="mt-3">
                <input type="hidden" name="idConversa" value={idConversa} />
                <button type="submit" className="w-full rounded-lg bg-red-500/90 px-3 py-2 text-sm font-semibold transition hover:bg-red-500">Apagar conversa</button>
              </form>
            </div>
          </details>
        </header>

        {/* Mensagens */}
        <div
          ref={rolagemRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            seguirFimRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
          }}
          role="log"
          aria-live="polite"
          aria-label={`Conversa com ${outro.nome}`}
          className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6"
        >
          {temMais && (
            <div className="mb-4 text-center">
              <button type="button" onClick={carregarAnteriores} disabled={carregando} className="rounded-full border border-white/15 px-4 py-1.5 text-xs text-white/70 transition hover:bg-white/5 disabled:opacity-60">
                {carregando ? "Carregando…" : "Carregar mensagens anteriores"}
              </button>
              {erroAnteriores && <p role="alert" className="mt-2 text-xs text-red-400">Não foi possível carregar. Tente de novo.</p>}
            </div>
          )}

          {msgs.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Avatar src={outro.avatar} nome={outro.nome} className="h-20 w-20" />
              <p className="mt-4 font-semibold">Esta é a sua conversa com {outro.nome}</p>
              <p className="mt-1 max-w-xs text-sm text-white/45">Ainda não há mensagens. Diga olá e comece a trocar ideias sobre música.</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {msgs.map((m, i) => {
                const meu = m.idAutor === euId;
                const data = new Date(m.enviadaEm);
                const anterior = msgs[i - 1];
                const novoDia = !anterior || fmtDia.format(new Date(anterior.enviadaEm)) !== fmtDia.format(data);
                const agrupada = !novoDia && anterior.idAutor === m.idAutor;
                return (
                  <li key={m.chave}>
                    {novoDia && (
                      <div className="my-4 flex items-center gap-3 text-[11px] text-white/35">
                        <span className="h-px flex-1 bg-white/10" />
                        <time dateTime={m.enviadaEm} suppressHydrationWarning>{fmtDia.format(data)}</time>
                        <span className="h-px flex-1 bg-white/10" />
                      </div>
                    )}
                    <div className={`flex items-end gap-2 ${meu ? "flex-row-reverse" : ""} ${agrupada ? "mt-0.5" : "mt-3"}`}>
                      {!meu && (agrupada ? <span className="w-8 shrink-0" /> : <Avatar src={outro.avatar} nome={outro.nome} className="h-8 w-8" />)}
                      <div className={`flex max-w-[80%] flex-col sm:max-w-[65%] ${meu ? "items-end" : "items-start"}`}>
                        <div
                          className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-[15px] leading-6 ${
                            meu
                              ? `rounded-br-md bg-violet-600 text-white ${m.status === "erro" ? "opacity-60 ring-1 ring-red-400" : ""} ${m.status === "enviando" ? "opacity-70" : ""}`
                              : "rounded-bl-md border border-white/10 bg-white/[0.06] text-white/90"
                          }`}
                        >
                          {m.texto}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 px-1 text-[11px] text-white/35">
                          {m.status === "enviando" ? (
                            <span>Enviando…</span>
                          ) : m.status === "erro" ? (
                            <>
                              <span role="alert" className="text-red-400">{m.erro ?? "Falha ao enviar."}</span>
                              <button type="button" onClick={() => void enviar(m.texto, m.chave)} className="font-medium text-violet-300 hover:underline">Tentar de novo</button>
                              <button type="button" onClick={() => setMsgs((prev) => prev.filter((x) => x.chave !== m.chave))} className="hover:underline">Descartar</button>
                            </>
                          ) : (
                            <time dateTime={m.enviadaEm} suppressHydrationWarning>{fmtHora.format(data)}</time>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {semConexao && (
          <p role="status" className="border-t border-amber-400/20 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-200">
            Sem conexão com o servidor. Tentando reconectar…
          </p>
        )}

        {/* Campo de mensagem */}
        {outro.ativo ? (
          <div className="relative border-t border-white/10 bg-[#0c0b12] p-3 sm:px-4">
            {emojis && (
              <div role="group" aria-label="Escolher emoji" className="absolute bottom-full left-3 mb-2 grid w-72 grid-cols-8 gap-1 rounded-xl border border-white/10 bg-[#14121c] p-2 shadow-2xl shadow-black/60 sm:left-4">
                {EMOJIS.map((e) => (
                  <button key={e} type="button" onClick={() => inserirEmoji(e)} aria-label={`Inserir ${e}`} className="rounded-md p-1 text-xl transition hover:bg-white/10">{e}</button>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2">
              <button type="button" onClick={() => setEmojis((v) => !v)} aria-expanded={emojis} aria-label="Emojis" className="rounded-lg p-2.5 text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">
                <IconeSorriso className="h-5 w-5" />
              </button>
              <div className="min-w-0 flex-1">
                <label htmlFor="campo-mensagem" className="sr-only">Mensagem para {outro.nome}</label>
                <textarea
                  id="campo-mensagem"
                  ref={campoRef}
                  value={texto}
                  rows={1}
                  maxLength={MAX_TEXTO_MENSAGEM}
                  placeholder={`Mensagem para ${outro.nome}`}
                  onChange={(e) => {
                    setTexto(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      aoEnviar();
                    }
                  }}
                  className="block max-h-36 w-full resize-none rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-[15px] leading-6 outline-none placeholder:text-white/35 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
                />
                {restantes <= 200 && <p className={`mt-1 text-right text-[11px] ${restantes < 0 ? "text-red-400" : "text-white/40"}`}>{restantes} caracteres restantes</p>}
              </div>
              <button type="button" onClick={aoEnviar} disabled={!texto.trim()} aria-label="Enviar mensagem" className="rounded-xl bg-violet-600 p-3 text-white transition hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-40">
                <IconeEnviar className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <p className="border-t border-white/10 bg-[#0c0b12] px-4 py-4 text-center text-sm text-white/45">Este usuário não está mais disponível. Você ainda pode ler o histórico.</p>
        )}
      </div>

      {/* Painel do perfil: ao lado do chat em telas largas, sobre a tela nas menores */}
      {painelAberto && (
        <>
          <button type="button" aria-label="Fechar perfil" onClick={() => setPainelAberto(false)} className="fixed inset-0 z-40 bg-black/60 xl:hidden" />
          <aside id="painel-perfil" aria-label={`Perfil de ${outro.nome}`} className="fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto border-l border-white/10 bg-[#0f0d16] xl:static xl:z-auto xl:w-80 xl:max-w-none xl:shrink-0">
            <button type="button" onClick={() => setPainelAberto(false)} aria-label="Fechar perfil" className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-2 text-white/80 hover:bg-black/70">
              <IconeFechar className="h-4 w-4" />
            </button>
            {painel}
          </aside>
        </>
      )}
    </div>
  );
}
