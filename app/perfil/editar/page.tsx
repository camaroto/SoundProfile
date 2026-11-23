import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buscarPerfil } from "@/lib/perfis";
import { exigirLogin } from "@/lib/sessao";
import AbasPerfil from "./abas";
import FormularioPerfil from "./formulario-perfil";

export const metadata: Metadata = {
  title: "Editar perfil | SoundProfile",
};

export default async function EditarPerfilPage() {
  const usuario = await exigirLogin(); // RN01
  const perfil = await buscarPerfil(usuario.username);
  if (!perfil) notFound();

  return (
    <main className="min-h-screen bg-[#08070d] text-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">Editar perfil</h1>
        <p className="mt-2 text-sm text-white/50">Seus dados pessoais: como o seu nome, a sua localização e a sua bio aparecem.</p>

        <AbasPerfil ativa="perfil" />

        <p className="mt-6 rounded-xl border border-violet-400/20 bg-violet-500/[0.07] p-4 text-sm leading-6 text-white/70">
          Foto de perfil, banner, moldura e balão de fala ficam na aba{" "}
          <Link href="/perfil/personalizar" className="font-semibold text-violet-300 hover:underline">Personalização</Link>.
        </p>

        <FormularioPerfil
          username={perfil.username}
          inicial={{
            nomeExibicao: perfil.nomeExibicao ?? "",
            localizacao: perfil.localizacao ?? "",
            biografia: perfil.biografia,
          }}
        />
      </div>
    </main>
  );
}
