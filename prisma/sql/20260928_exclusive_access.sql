BEGIN;
CREATE TABLE IF NOT EXISTS public."AcessoExclusivo" (
 "id" TEXT NOT NULL PRIMARY KEY,
 "nome" TEXT NOT NULL,
 "telefone" TEXT NOT NULL,
 "ativo" BOOLEAN NOT NULL DEFAULT true,
 "tokenHash" TEXT,
 "expiraEm" TIMESTAMP(3) NOT NULL,
 "usadoEm" TIMESTAMP(3),
 "versao" INTEGER NOT NULL DEFAULT 1,
 "criadoPor" TEXT NOT NULL,
 "atualizadoPor" TEXT NOT NULL,
 "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "atualizadoEm" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "AcessoExclusivo_tokenHash_key" ON public."AcessoExclusivo"("tokenHash");
ALTER TABLE public."AcessoExclusivo" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."AcessoExclusivo" FROM anon, authenticated;
ALTER TABLE public."Pedido" ADD COLUMN IF NOT EXISTS "acessoExclusivoId" TEXT;
COMMIT;
