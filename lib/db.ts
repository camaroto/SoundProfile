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
