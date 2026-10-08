CREATE TABLE IF NOT EXISTS "CorGlobal" ("id" TEXT PRIMARY KEY, "nome" TEXT NOT NULL UNIQUE, "hexCor" TEXT, "ativo" BOOLEAN NOT NULL DEFAULT true, "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
ALTER TABLE "ProdutoCor" ADD COLUMN IF NOT EXISTS "corGlobalId" TEXT;
CREATE INDEX IF NOT EXISTS "ProdutoCor_corGlobalId_idx" ON "ProdutoCor"("corGlobalId");
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProdutoCor_corGlobalId_fkey') THEN ALTER TABLE "ProdutoCor" ADD CONSTRAINT "ProdutoCor_corGlobalId_fkey" FOREIGN KEY ("corGlobalId") REFERENCES "CorGlobal"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;
