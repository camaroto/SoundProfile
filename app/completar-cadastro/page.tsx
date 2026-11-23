
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CampoTexto from "@/app/components/campo-texto";

export default function CompletarCadastroPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [disponivel, setDisponivel] = useState<boolean | null>(null);
  const [verificando, setVerificando] = useState(false);
  const [pendente, setPendente] = useState(false);
  const [erro, setErro] = useState("");
  const [erroGeral, setErroGeral] = useState("");

  const usernameValido = /^[a-zA-Z0-9_.]{3,20}$/.test(username);

  useEffect(() => {
    setDisponivel(null);
    setErroGeral("");

    if (!usernameValido) return;

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
      setVerificando(true);

      try {
        const resposta = await fetch("/api/auth/google/username-disponivel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
          signal: controller.signal,
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
          setErroGeral(dados.mensagem || "Não foi possível verificar o username.");
          return;
        }

        setDisponivel(dados.disponivel);
      } catch (erro) {
        if (erro instanceof Error && erro.name !== "AbortError") {
          setErroGeral("Não foi possível verificar o username.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setVerificando(false);
        }
      }
    }, 400);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [username, usernameValido]);

  async function finalizarCadastro(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!usernameValido || disponivel !== true) return;

    setPendente(true);
    setErro("");
    setErroGeral("");

    try {
      const resposta = await fetch("/api/auth/google/finalizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.campos?.username || "");
        setErroGeral(dados.mensagem || "Não foi possível concluir o cadastro.");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setErroGeral("Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setPendente(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-64px)]">
      <div
        className="relative flex min-h-[calc(100vh-64px)] items-center justify-center bg-cover bg-center px-4 py-8"
        style={{ backgroundImage: "url('/background-home.webp')" }}
      >
        <div className="absolute inset-0 bg-black/80" />

        <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900/95 px-6 py-8 shadow-2xl sm:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white">
              Quase lá!
            </h1>

            <p className="mt-2 text-sm text-neutral-400">
              Escolha seu nome de usuário para concluir seu cadastro no SoundProfile.
            </p>
          </div>

          <form onSubmit={finalizarCadastro} className="flex flex-col gap-5">
            {erroGeral && (
              <p
                role="alert"
                className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
              >
                {erroGeral}
              </p>
            )}

            <div>
              <CampoTexto
                id="username"
                rotulo="Nome de usuário"
                icone="/headphone-svgrepo-com.svg"
                type="text"
                placeholder="Escolha seu username"
                autoComplete="username"
                maxLength={20}
                minLength={3}
                required
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  setErro("");
                }}
                erro={erro}
                ajuda="Use de 3 a 20 caracteres: letras, números, ponto ou underline."
              />

              <div className="mt-2 text-xs" aria-live="polite">
                {username.length > 0 && !usernameValido && (
                  <p className="text-red-400">
                    O username precisa ter entre 3 e 20 caracteres válidos.
                  </p>
                )}

                {usernameValido && verificando && (
                  <p className="text-neutral-400">
                    Verificando disponibilidade...
                  </p>
                )}

                {usernameValido && !verificando && disponivel === true && (
                  <p className="text-green-400">
                    Username disponível!
                  </p>
                )}

                {usernameValido && !verificando && disponivel === false && (
                  <p className="text-red-400">
                    Esse username não está disponível.
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!usernameValido || disponivel !== true || verificando || pendente}
              className="mt-2 w-full rounded-lg bg-purple-600 p-3 font-bold text-white transition hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pendente ? "Finalizando cadastro..." : "Concluir cadastro"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
