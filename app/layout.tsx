import type { Metadata } from "next";
import "./globals.css";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";
import { obterUsuarioLogado } from "@/lib/sessao";

export const metadata: Metadata = {
  title: "SoundProfile | Sua música, sua identidade",
  description:
    "Avalie álbuns, crie listas e compartilhe sua identidade musical com a comunidade.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await obterUsuarioLogado();

  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <Header
          usuario={usuario ? { username: usuario.username, avatar: usuario.avatar, admin: usuario.role === "admin" } : null}
        />
        {children}
        <Footer />
      </body>
    </html>
  );
}
