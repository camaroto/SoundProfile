import { obterUsuarioLogado } from "@/lib/sessao";
import { contarMensagensNaoLidas } from "@/lib/mensagens";
import { contarNotificacoesNaoLidas } from "@/lib/notificacoes";

// Contadores do menu (mensagens e avisos não lidos). Só leitura.
export async function GET() {
  const usuario = await obterUsuarioLogado();
  if (!usuario) return Response.json({ erro: "Não autenticado." }, { status: 401, headers: { "Cache-Control": "no-store" } });

  const [mensagens, notificacoes] = await Promise.all([
    contarMensagensNaoLidas(usuario.idUsuario),
    contarNotificacoesNaoLidas(usuario.idUsuario),
  ]);
  return Response.json({ mensagens, notificacoes }, { headers: { "Cache-Control": "no-store" } });
}
