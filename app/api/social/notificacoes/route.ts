import { obterUsuarioLogado } from "@/lib/sessao";
import { contarNotificacoesNaoLidas, listarNotificacoes } from "@/lib/notificacoes";

// Últimas notificações para o sino do menu. Só leitura.
export async function GET() {
  const usuario = await obterUsuarioLogado();
  if (!usuario) return Response.json({ erro: "Não autenticado." }, { status: 401, headers: { "Cache-Control": "no-store" } });

  const [itens, naoLidas] = await Promise.all([listarNotificacoes(usuario.idUsuario, 10), contarNotificacoesNaoLidas(usuario.idUsuario)]);
  return Response.json(
    {
      naoLidas,
      itens: itens.map((i) => ({
        id: i.idNotificacao,
        tipo: i.tipo,
        lida: i.lida,
        criadaEm: i.criadaEm.toISOString(),
        username: i.username,
        nome: i.nomeExibicao || i.username,
        avatar: i.avatar,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
