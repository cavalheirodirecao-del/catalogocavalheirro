-- Additive and rerunnable. Apply before deploying the tracking release.
BEGIN;
ALTER TABLE public."Visita" ADD COLUMN IF NOT EXISTS "visitanteId" TEXT;
ALTER TABLE public."Pedido" ADD COLUMN IF NOT EXISTS "visitanteId" TEXT;
ALTER TABLE public."Pedido" ADD COLUMN IF NOT EXISTS "origemRastreamento" TEXT;
ALTER TABLE public."Pedido" ADD COLUMN IF NOT EXISTS "chaveCheckout" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Pedido_chaveCheckout_key" ON public."Pedido"("chaveCheckout");
CREATE INDEX IF NOT EXISTS "Visita_vendedorId_criadoEm_idx" ON public."Visita"("vendedorId", "criadoEm");
CREATE INDEX IF NOT EXISTS "Visita_afiliadoId_criadoEm_idx" ON public."Visita"("afiliadoId", "criadoEm");
CREATE INDEX IF NOT EXISTS "Visita_visitanteId_idx" ON public."Visita"("visitanteId");
COMMIT;
