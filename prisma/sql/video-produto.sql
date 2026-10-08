CREATE TABLE IF NOT EXISTS "VideoProduto" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "produtoId" TEXT NOT NULL,
  "bunnyVideoId" TEXT,
  "bunnyLibraryId" TEXT,
  "cdnUrl" TEXT NOT NULL,
  "thumbnailUrl" TEXT,
  "titulo" TEXT,
  "legenda" TEXT,
  "ordem" INTEGER NOT NULL DEFAULT 0,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "canais" JSONB NOT NULL,
  "statusProcessamento" TEXT NOT NULL DEFAULT 'PRONTO',
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "VideoProduto_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "VideoProduto_produtoId_ativo_ordem_idx" ON "VideoProduto" ("produtoId", "ativo", "ordem");
