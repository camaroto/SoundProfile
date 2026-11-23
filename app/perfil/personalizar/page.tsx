import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buscarPerfil } from "@/lib/perfis";
import { exigirLogin } from "@/lib/sessao";
import AbasPerfil from "../editar/abas";
import FormularioPersonalizacao from "./formulario-personalizacao";

export const metadata: Metadata = {
  title: "Personalizar perfil | SoundProfile",
};

export default async function PersonalizarPerfilPage() {
  const usuario = await exigirLogin(); // RN01
  const perfil = await buscarPerfil(usuario.username);
  if (!perfil) notFound();

  return (
    <main className="min-h-screen bg-[#08070d] text-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-semibold tracking-tight">Editar perfil</h1>
        <p className="mt-2 text-sm text-white/50">Personalize a aparência do seu perfil: imagens, moldura e balão.</p>

        <AbasPerfil ativa="personalizacao" />

        <FormularioPersonalizacao
          username={perfil.username}
          nomeExibicao={perfil.nomeExibicao ?? ""}
          avatarAtual={perfil.avatar}
          bannerAtual={perfil.banner}
          molduraAtual={perfil.moldura}
          balaoAtual={perfil.balao}
        />
      </div>
    </main>
  );
}
