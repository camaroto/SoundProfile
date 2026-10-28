import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buscarPerfil } from "@/lib/perfis";
import { exigirLogin } from "@/lib/sessao";
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
        <p className="mt-2 text-sm text-white/50">
          Personalize como as pessoas veem você no SoundProfile.
        </p>

        <FormularioPerfil
          username={perfil.username}
          inicial={{
            nomeExibicao: perfil.nomeExibicao ?? "",
            localizacao: perfil.localizacao ?? "",
            biografia: perfil.biografia,
          }}
          avatarAtual={perfil.avatar}
          bannerAtual={perfil.banner}
        />
      </div>
    </main>
  );
}
