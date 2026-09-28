import { z } from "zod";

export const pedidoInput = z.object({
  catalogo: z.enum(["VAREJO", "ATACADO", "FABRICA"]),
  formaPagamento: z.enum(["VISTA", "PRAZO"]),
  tipoEnvio: z.enum(["RETIRADA_LOJA", "CORREIOS", "EXCURSAO"]),
  nomeCliente: z.string().trim().min(2).max(160),
  telefoneCliente: z.string().transform(v => v.replace(/\D/g, "")).pipe(z.string().min(10).max(15)),
  vendedorId: z.string().max(100).nullable().optional(),
  lojaRetiradaId: z.string().max(100).nullable().optional(),
  excursaoTexto: z.string().max(4000).nullable().optional(),
  enderecoEntrega: z.string().max(4000).nullable().optional(),
  servicoFreteId: z.string().max(30).nullable().optional(),
  cupomCodigo: z.string().trim().max(100).nullable().optional(),
  obs: z.string().max(2000).nullable().optional(),
  chaveCheckout: z.string().uuid(),
  total: z.number().finite().nonnegative(),
  itens: z.array(z.object({ varianteId: z.string().min(1).max(100), quantidade: z.number().int().min(1).max(10000) })).min(1).max(200),
});
export type PedidoInput = z.infer<typeof pedidoInput>;
export function aggregateItems(items: PedidoInput["itens"]) {
  const map = new Map<string, number>();
  for (const item of items) map.set(item.varianteId, (map.get(item.varianteId) ?? 0) + item.quantidade);
  return Array.from(map).map(([varianteId, quantidade]) => ({ varianteId, quantidade }));
}
export function priceField(catalogo: PedidoInput["catalogo"], pagamento: PedidoInput["formaPagamento"]) {
  const base = { VAREJO: "precoVarejo", ATACADO: "precoAtacado", FABRICA: "precoFabrica" }[catalogo];
  return base + (pagamento === "VISTA" ? "Vista" : "Prazo");
}
export function cents(value: unknown) { return Math.round(Number(value) * 100); }
export function discountCents(subtotal: number, tipo?: string, valor?: unknown) {
  if (tipo === "PERCENTUAL") return Math.min(subtotal, Math.max(0, Math.round(subtotal * Number(valor) / 100)));
  if (tipo === "VALOR_FIXO") return Math.min(subtotal, Math.max(0, cents(valor)));
  return 0;
}
export const SALE_STATUSES = ["CONFIRMADO", "SEPARANDO", "ENVIADO", "CONCLUIDO"] as const;
