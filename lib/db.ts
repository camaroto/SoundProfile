import { Pool, type PoolClient } from "pg";

// Conexão com o PostgreSQL. O endereço do banco vem da variável de ambiente
// DATABASE_URL (arquivo .env.local), nunca fica escrito no código.
// As tabelas seguem o modelo lógico do documento (seção 5.2).

const SCHEMA = `
CREATE TABLE IF NOT EXISTS Usuario (
  idUsuario    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username     VARCHAR(20)  NOT NULL,
  email        VARCHAR(254) NOT NULL,
  senhaHash    TEXT         NOT NULL,
  role         VARCHAR(10)  NOT NULL DEFAULT 'usuario' CHECK (role IN ('usuario', 'admin')),
  status       VARCHAR(10)  NOT NULL DEFAULT 'ativa'   CHECK (status IN ('ativa', 'inativa', 'excluida')),
  dataCadastro TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Unicidade sem diferenciar maiúsculas de minúsculas (RN02).
CREATE UNIQUE INDEX IF NOT EXISTS usuario_username_unico ON Usuario (LOWER(username));
CREATE UNIQUE INDEX IF NOT EXISTS usuario_email_unico    ON Usuario (LOWER(email));

CREATE TABLE IF NOT EXISTS Perfil (
  idPerfil  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  idUsuario INTEGER NOT NULL UNIQUE REFERENCES Usuario(idUsuario) ON DELETE CASCADE,
  avatar    TEXT,
  banner    TEXT,
  biografia TEXT NOT NULL DEFAULT ''
);

-- Campos do perfil público (exemplo da tela de perfil). IF NOT EXISTS permite
-- atualizar bancos criados antes desta versão.
ALTER TABLE Perfil ADD COLUMN IF NOT EXISTS nomeExibicao VARCHAR(40);
ALTER TABLE Perfil ADD COLUMN IF NOT EXISTS localizacao  VARCHAR(60);

-- Sessões de login. Guardamos só o hash do token; o token em si vive no cookie.
CREATE TABLE IF NOT EXISTS Sessao (
  idSessao  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  idUsuario INTEGER     NOT NULL REFERENCES Usuario(idUsuario) ON DELETE CASCADE,
  tokenHash CHAR(64)    NOT NULL UNIQUE,
  criadaEm  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expiraEm  TIMESTAMPTZ NOT NULL
);

-- Imagens de avatar e banner, guardadas no próprio banco (funciona em qualquer
-- hospedagem, sem depender de disco).
CREATE TABLE IF NOT EXISTS Imagem (
  idImagem INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tipo     VARCHAR(30) NOT NULL,
  dados    BYTEA       NOT NULL,
  criadaEm TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===== Catálogo musical =====
-- Por enquanto o conteúdo é cadastrado por administradores. As colunas spotifyId
-- ficam prontas para a futura integração preencher as mesmas tabelas.
CREATE TABLE IF NOT EXISTS Genero (
  idGenero INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug     VARCHAR(40) NOT NULL UNIQUE,
  nome     VARCHAR(40) NOT NULL
);

INSERT INTO Genero (slug, nome) VALUES
  ('rock', 'Rock'), ('metal', 'Metal'), ('pop', 'Pop'), ('rap', 'Rap'),
  ('jazz', 'Jazz'), ('mpb', 'MPB'), ('eletronica', 'Eletrônica'),
  ('indie', 'Indie'), ('rb-soul', 'R&B e Soul'), ('blues', 'Blues'),
  ('reggae', 'Reggae'), ('country', 'Country'), ('samba-pagode', 'Samba e Pagode'),
  ('classica', 'Clássica'), ('punk', 'Punk'), ('funk', 'Funk'),
  ('sertanejo', 'Sertanejo'), ('folk', 'Folk')
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS Artista (
  idArtista INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug      VARCHAR(80)  NOT NULL UNIQUE,
  nome      VARCHAR(100) NOT NULL,
  biografia TEXT         NOT NULL DEFAULT '',
  imagem    TEXT,
  spotifyId VARCHAR(40)  UNIQUE,
  criadoEm  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS Album (
  idAlbum   INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug      VARCHAR(80)  NOT NULL UNIQUE,
  titulo    VARCHAR(150) NOT NULL,
  idArtista INTEGER      NOT NULL REFERENCES Artista(idArtista) ON DELETE CASCADE,
  ano       SMALLINT     CHECK (ano BETWEEN 1900 AND 2100),
  capa      TEXT,
  spotifyId VARCHAR(40)  UNIQUE,
  criadoEm  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS Musica (
  idMusica  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug      VARCHAR(100) NOT NULL UNIQUE,
  titulo    VARCHAR(150) NOT NULL,
  idArtista INTEGER      NOT NULL REFERENCES Artista(idArtista) ON DELETE CASCADE,
  idAlbum   INTEGER      REFERENCES Album(idAlbum) ON DELETE SET NULL,
  faixa     SMALLINT     CHECK (faixa BETWEEN 1 AND 500),
  spotifyId VARCHAR(40)  UNIQUE,
  criadoEm  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Álbuns e músicas herdam os gêneros do artista.
CREATE TABLE IF NOT EXISTS ArtistaGenero (
  idArtista INTEGER NOT NULL REFERENCES Artista(idArtista) ON DELETE CASCADE,
  idGenero  INTEGER NOT NULL REFERENCES Genero(idGenero) ON DELETE CASCADE,
  PRIMARY KEY (idArtista, idGenero)
);

-- ===== Avaliações (RN03: uma por usuário e por item) =====
-- Exatamente uma das três colunas de item é preenchida, e cada uma mantém
-- chave estrangeira real (por isso não usamos uma coluna "tipo" genérica).
CREATE TABLE IF NOT EXISTS Avaliacao (
  idAvaliacao  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  idUsuario    INTEGER NOT NULL REFERENCES Usuario(idUsuario) ON DELETE CASCADE,
  idArtista    INTEGER REFERENCES Artista(idArtista) ON DELETE CASCADE,
  idAlbum      INTEGER REFERENCES Album(idAlbum)     ON DELETE CASCADE,
  idMusica     INTEGER REFERENCES Musica(idMusica)   ON DELETE CASCADE,
  nota         NUMERIC(2,1) NOT NULL CHECK (nota >= 0.5 AND nota <= 5 AND MOD(nota * 10, 5) = 0),
  comentario   TEXT NOT NULL DEFAULT '' CHECK (char_length(comentario) <= 1000),
  criadaEm     TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizadaEm TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (num_nonnulls(idArtista, idAlbum, idMusica) = 1)
);
CREATE UNIQUE INDEX IF NOT EXISTS avaliacao_unica_artista ON Avaliacao (idUsuario, idArtista) WHERE idArtista IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS avaliacao_unica_album   ON Avaliacao (idUsuario, idAlbum)   WHERE idAlbum   IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS avaliacao_unica_musica  ON Avaliacao (idUsuario, idMusica)  WHERE idMusica  IS NOT NULL;
CREATE INDEX IF NOT EXISTS avaliacao_por_artista ON Avaliacao (idArtista) WHERE idArtista IS NOT NULL;
CREATE INDEX IF NOT EXISTS avaliacao_por_album   ON Avaliacao (idAlbum)   WHERE idAlbum   IS NOT NULL;
CREATE INDEX IF NOT EXISTS avaliacao_por_musica  ON Avaliacao (idMusica)  WHERE idMusica  IS NOT NULL;

CREATE TABLE IF NOT EXISTS CurtidaAvaliacao (
  idAvaliacao INTEGER NOT NULL REFERENCES Avaliacao(idAvaliacao) ON DELETE CASCADE,
  idUsuario   INTEGER NOT NULL REFERENCES Usuario(idUsuario)     ON DELETE CASCADE,
  PRIMARY KEY (idAvaliacao, idUsuario)
);

CREATE TABLE IF NOT EXISTS Favorito (
  idFavorito INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  idUsuario  INTEGER NOT NULL REFERENCES Usuario(idUsuario) ON DELETE CASCADE,
  idArtista  INTEGER REFERENCES Artista(idArtista) ON DELETE CASCADE,
  idAlbum    INTEGER REFERENCES Album(idAlbum)     ON DELETE CASCADE,
  idMusica   INTEGER REFERENCES Musica(idMusica)   ON DELETE CASCADE,
  criadoEm   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (num_nonnulls(idArtista, idAlbum, idMusica) = 1)
);
CREATE UNIQUE INDEX IF NOT EXISTS favorito_unico_artista ON Favorito (idUsuario, idArtista) WHERE idArtista IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS favorito_unico_album   ON Favorito (idUsuario, idAlbum)   WHERE idAlbum   IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS favorito_unico_musica  ON Favorito (idUsuario, idMusica)  WHERE idMusica  IS NOT NULL;

-- ===== Social: seguidores, mensagens privadas e notificações =====
-- Seguir é de mão única e não precisa de aprovação: uma linha = "idSeguidor segue idSeguido".
CREATE TABLE IF NOT EXISTS Seguidor (
  idSeguidor INTEGER     NOT NULL REFERENCES Usuario(idUsuario) ON DELETE CASCADE,
  idSeguido  INTEGER     NOT NULL REFERENCES Usuario(idUsuario) ON DELETE CASCADE,
  criadoEm   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (idSeguidor, idSeguido),
  CHECK (idSeguidor <> idSeguido)
);
CREATE INDEX IF NOT EXISTS seguidor_por_seguido ON Seguidor (idSeguido, criadoEm DESC);

-- Conversa privada entre dois usuários (sempre idUsuarioA < idUsuarioB, então só existe uma por par).
CREATE TABLE IF NOT EXISTS Conversa (
  idConversa INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  idUsuarioA INTEGER     NOT NULL REFERENCES Usuario(idUsuario) ON DELETE CASCADE,
  idUsuarioB INTEGER     NOT NULL REFERENCES Usuario(idUsuario) ON DELETE CASCADE,
  criadaEm   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (idUsuarioA < idUsuarioB),
  UNIQUE (idUsuarioA, idUsuarioB)
);

-- Estado de cada participante: até que mensagem leu (lidaAte) e até onde apagou a
-- conversa da própria lista (limpaAte). Apagar não mexe no histórico do outro usuário.
CREATE TABLE IF NOT EXISTS ParticipanteConversa (
  idConversa INTEGER NOT NULL REFERENCES Conversa(idConversa) ON DELETE CASCADE,
  idUsuario  INTEGER NOT NULL REFERENCES Usuario(idUsuario)   ON DELETE CASCADE,
  lidaAte    INTEGER NOT NULL DEFAULT 0,
  limpaAte   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (idConversa, idUsuario)
);
CREATE INDEX IF NOT EXISTS participante_por_usuario ON ParticipanteConversa (idUsuario);

CREATE TABLE IF NOT EXISTS Mensagem (
  idMensagem INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  idConversa INTEGER     NOT NULL REFERENCES Conversa(idConversa) ON DELETE CASCADE,
  idAutor    INTEGER     NOT NULL REFERENCES Usuario(idUsuario)   ON DELETE CASCADE,
  texto      TEXT        NOT NULL CHECK (char_length(texto) BETWEEN 1 AND 2000),
  enviadaEm  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mensagem_por_conversa   ON Mensagem (idConversa, idMensagem);
CREATE INDEX IF NOT EXISTS mensagem_por_autor_data ON Mensagem (idAutor, enviadaEm);

-- Mensagens novas não geram linha aqui (o contador vem de lidaAte, sem repetição).
-- Esta tabela guarda os avisos de novos seguidores; o índice evita avisos repetidos não lidos.
CREATE TABLE IF NOT EXISTS Notificacao (
  idNotificacao INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  idUsuario     INTEGER     NOT NULL REFERENCES Usuario(idUsuario) ON DELETE CASCADE,
  tipo          VARCHAR(30) NOT NULL,
  idOrigem      INTEGER     REFERENCES Usuario(idUsuario) ON DELETE CASCADE,
  lida          BOOLEAN     NOT NULL DEFAULT false,
  criadaEm      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS notificacao_sem_repeticao
  ON Notificacao (idUsuario, tipo, idOrigem) WHERE lida = false;
CREATE INDEX IF NOT EXISTS notificacao_por_usuario ON Notificacao (idUsuario, lida, criadaEm DESC);
`;

const global_ = globalThis as {
  __soundprofilePool?: Pool;
  __soundprofileSchema?: Promise<void>;
};

function getPool(): Pool {
  if (!global_.__soundprofilePool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL não definida. Crie o arquivo .env.local (veja .env.example).",
      );
    }
    global_.__soundprofilePool = new Pool({ connectionString, max: 10 });
  }
  return global_.__soundprofilePool;
}

// Cria as tabelas na primeira utilização. O lock evita que dois processos
// tentem criar ao mesmo tempo.
async function garantirSchema(pool: Pool): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(727274)");
    await client.query(SCHEMA);
    await client.query("COMMIT");
  } catch (erro) {
    await client.query("ROLLBACK").catch(() => {});
    throw erro;
  } finally {
    client.release();
  }
}

export async function query<T extends object = Record<string, unknown>>(
  texto: string,
  parametros: unknown[] = [],
): Promise<T[]> {
  const pool = getPool();
  global_.__soundprofileSchema ??= garantirSchema(pool).catch((erro) => {
    global_.__soundprofileSchema = undefined; // tenta de novo na próxima chamada
    throw erro;
  });
  await global_.__soundprofileSchema;
  const resultado = await pool.query(texto, parametros);
  return resultado.rows as T[];
}

// Executa vários comandos como uma unidade: ou tudo grava, ou nada grava.
export async function transacao<T>(
  trabalho: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const pool = getPool();
  await query("SELECT 1"); // garante que o schema existe
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const resultado = await trabalho(client);
    await client.query("COMMIT");
    return resultado;
  } catch (erro) {
    await client.query("ROLLBACK").catch(() => {});
    throw erro;
  } finally {
    client.release();
  }
}
