import { obterUsuarioLogado } from "@/lib/sessao";
import { carregarConversa, listarMensagens } from "@/lib/mensagens";

const SEM_CACHE = { "Cache-Control": "no-store" };

const inteiro = (valor: string | null): number | undefined => {
  if (valor === null || !/^\d{1,9}$/.test(valor)) return undefined;
  return Number(valor);
};

// ?depois=ID  -> mensagens novas (atualização automática do chat)
// ?antes=ID   -> mensagens mais antigas (botão "carregar anteriores")
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const usuario = await obterUsuarioLogado();
  if (!usuario) return Response.json({ erro: "Não autenticado." }, { status: 401, headers: SEM_CACHE });

  const { id } = await params;
  const idConversa = inteiro(id);
  if (!idConversa) return Response.json({ erro: "Conversa não encontrada." }, { status: 404, headers: SEM_CACHE });

  // Acesso só para participantes. Para quem não participa, a resposta é igual à de uma conversa inexistente.
  const conversa = await carregarConversa(usuario.idUsuario, idConversa);
  if (!conversa) return Response.json({ erro: "Conversa não encontrada." }, { status: 404, headers: SEM_CACHE });

  const url = new URL(req.url);
  const resultado = await listarMensagens(usuario.idUsuario, idConversa, {
    depois: inteiro(url.searchParams.get("depois")),
    antes: inteiro(url.searchParams.get("antes")),
  });
  return Response.json(resultado, { headers: SEM_CACHE });
}
