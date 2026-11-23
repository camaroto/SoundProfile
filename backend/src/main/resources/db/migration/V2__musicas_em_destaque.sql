-- V2: músicas em destaque (catálogo inicial com músicas famosas, mostrado a quem ainda não entrou).
ALTER TABLE Musica ADD COLUMN IF NOT EXISTS destaque      BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE Musica ADD COLUMN IF NOT EXISTS destaqueOrdem INTEGER;
CREATE INDEX IF NOT EXISTS musica_destaque ON Musica (destaqueOrdem) WHERE destaque;
