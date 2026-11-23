
-- Cadastro temporário de novos usuários pelo Google.
-- O token é armazenado somente como hash e expira em 10 minutos.

CREATE TABLE IF NOT EXISTS CadastroGooglePendente (
    tokenHash CHAR(64) PRIMARY KEY,
    googleId VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL,
    nomeExibicao VARCHAR(40),
    expiraEm TIMESTAMPTZ NOT NULL,
    criadaEm TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cadastro_google_pendente_expiracao
    ON CadastroGooglePendente (expiraEm);
