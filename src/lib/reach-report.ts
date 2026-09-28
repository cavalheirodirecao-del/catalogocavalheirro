import { SALE_STATUSES } from "./order-rules";

type Identity = { id: string; slug: string; nome: string; tipo: "VENDEDOR" | "AFILIADO" };
export type VisitRow = { vendedorId: string | null; afiliadoId: string | null; visitanteId: string | null; ip: string | null; catalogo: string; criadoEm: Date };
export type OrderRow = { vendedorId: string | null; afiliadoId: string | null; status: string; total: unknown; origemRastreamento: string | null };
export function buildReachReport(identities: Identity[], visits: VisitRow[], orders: OrderRow[]) {
  const allVisitors = new Set<string>();
  const rows = identities.map(identity => {
    const own = (row: { vendedorId: string | null; afiliadoId: string | null }) => identity.tipo === "VENDEDOR" ? row.vendedorId === identity.id : row.afiliadoId === identity.id;
    const vs = visits.filter(own);
    const os = orders.filter(own);
    const visitors = new Set(vs.map(v => v.visitanteId).filter((id): id is string => !!id));
    visitors.forEach(id => allVisitors.add(id));
    const legacyIps = new Set(vs.filter(v => !v.visitanteId).map(v => v.ip).filter(Boolean));
    const sales = os.filter(o => (SALE_STATUSES as readonly string[]).includes(o.status));
    const source = identity.tipo === "VENDEDOR" ? "LINK_VENDEDOR" : "LINK_AFILIADO";
    return {
      ...identity, totalVisitas: vs.length, visitantesUnicos: visitors.size, ipsLegados: legacyIps.size,
      ultimaVisita: vs.length ? new Date(Math.max(...vs.map(v => v.criadoEm.getTime()))).toISOString() : null,
      porCatalogo: Object.fromEntries(["VAREJO","ATACADO","FABRICA"].map(c => [c, vs.filter(v => v.catalogo === c).length])),
      totalPedidos: os.length, pedidosViaLink: os.filter(o => o.origemRastreamento === source).length,
      compras: sales.length, comprasViaLink: sales.filter(o => o.origemRastreamento === source).length,
      pendentes: os.filter(o => o.status === "PENDENTE").length, cancelados: os.filter(o => o.status === "CANCELADO").length,
      valorCompras: sales.reduce((sum, o) => sum + Number(o.total), 0),
      pedidosLegados: os.filter(o => !o.origemRastreamento).length,
    };
  }).sort((a,b) => b.visitantesUnicos - a.visitantesUnicos || b.compras - a.compras);
  return {
    ranking: rows,
    totais: {
      totalVisitas: visits.length, visitantesUnicos: allVisitors.size,
      totalPedidos: rows.reduce((n,r)=>n+r.totalPedidos,0), compras: rows.reduce((n,r)=>n+r.compras,0),
      valorCompras: rows.reduce((n,r)=>n+r.valorCompras,0),
    },
  };
}
