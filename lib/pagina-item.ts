import type { TipoItem } from "./constantes";
import { avaliacoesDoItem, ehFavorito, estatisticasItem, minhaAvaliacao } from "./avaliacoes";

// Tudo que a página de um artista, álbum ou música precisa sobre avaliações.
export async function carregarDadosItem(tipo: TipoItem, idItem: number, idUsuario: number | null) {
  const [stats, avaliacoes, minha, favorito] = await Promise.all([
    estatisticasItem(tipo, idItem),
    avaliacoesDoItem(tipo, idItem, idUsuario),
    idUsuario ? minhaAvaliacao(idUsuario, tipo, idItem) : Promise.resolve(null),
    idUsuario ? ehFavorito(idUsuario, tipo, idItem) : Promise.resolve(false),
  ]);
  return { stats, avaliacoes, minha, favorito };
}

export type DadosItem = Awaited<ReturnType<typeof carregarDadosItem>>;
