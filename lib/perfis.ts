import { query, transacao } from "./db";
import { idDaUrl, inserirImagem } from "./imagens";

export type Perfil = {
  idUsuario: number;
  username: string;
  dataCadastro: Date;
  nomeExibicao: string | null;
  localizacao: string | null;
  biografia: string;
  avatar: string | null;
  banner: string | null;
};

export async function buscarPerfil(username: string): Promise<Perfil | null> {
  const linhas = await query<{
    idusuario: number;
    username: string;
    datacadastro: Date;
    nomeexibicao: string | null;
    localizacao: string | null;
    biografia: string;
    avatar: string | null;
    banner: string | null;
  }>(
    `SELECT u.idUsuario, u.username, u.dataCadastro, p.nomeExibicao, p.localizacao,
            p.biografia, p.avatar, p.banner
       FROM Usuario u
       JOIN Perfil p ON p.idUsuario = u.idUsuario
      WHERE LOWER(u.username) = LOWER($1) AND u.status = 'ativa'`,
    [username],
  );
  const l = linhas[0];
  if (!l) return null;
  return {
    idUsuario: l.idusuario,
    username: l.username,
    dataCadastro: l.datacadastro,
    nomeExibicao: l.nomeexibicao,
    localizacao: l.localizacao,
    biografia: l.biografia,
    avatar: l.avatar,
    banner: l.banner,
  };
}

// Para cada imagem: undefined = manter, null = remover, Buffer = trocar.
export type MudancaImagem = Buffer | null | undefined;

export type DadosPerfil = {
  nomeExibicao: string | null;
  localizacao: string | null;
  biografia: string;
  avatar: MudancaImagem;
  banner: MudancaImagem;
};

// Tudo numa transação: ou o perfil inteiro é atualizado, ou nada muda.
// As imagens antigas são apagadas para não acumular lixo no banco.
export async function atualizarPerfil(idUsuario: number, dados: DadosPerfil): Promise<void> {
  await transacao(async (client) => {
    const atual = (
      await client.query<{ avatar: string | null; banner: string | null }>(
        "SELECT avatar, banner FROM Perfil WHERE idUsuario = $1 FOR UPDATE",
        [idUsuario],
      )
    ).rows[0];

    let avatar = atual.avatar;
    let banner = atual.banner;
    const antigas: (string | null)[] = [];

    if (dados.avatar !== undefined) {
      antigas.push(atual.avatar);
      avatar = dados.avatar ? await inserirImagem(client, dados.avatar) : null;
    }
    if (dados.banner !== undefined) {
      antigas.push(atual.banner);
      banner = dados.banner ? await inserirImagem(client, dados.banner) : null;
    }

    await client.query(
      `UPDATE Perfil
          SET nomeExibicao = $2, localizacao = $3, biografia = $4, avatar = $5, banner = $6
        WHERE idUsuario = $1`,
      [idUsuario, dados.nomeExibicao, dados.localizacao, dados.biografia, avatar, banner],
    );

    for (const url of antigas) {
      const id = idDaUrl(url);
      if (id) await client.query("DELETE FROM Imagem WHERE idImagem = $1", [id]);
    }
  });
}
