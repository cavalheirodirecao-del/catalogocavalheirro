import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getIntervalo(periodo: string): { inicio: Date; labels: string[] } {
  const agora = new Date();

  if (periodo === "diario") {
    const inicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    // Labels: últimas 24h por hora
    const labels: string[] = [];
    for (let h = 0; h < 24; h++) labels.push(`${String(h).padStart(2, "0")}h`);
    return { inicio, labels };
  }

  if (periodo === "semanal") {
    const dia = agora.getDay(); // 0=Dom
    const diff = dia === 0 ? 6 : dia - 1; // segunda
    const inicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - diff);
    const labels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    return { inicio, labels };
  }

  if (periodo === "anual") {
    const inicio = new Date(agora.getFullYear(), 0, 1);
    const labels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return { inicio, labels };
  }

  // mensal (default)
  const inicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const diasNoMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0).getDate();
  const labels: string[] = [];
  for (let d = 1; d <= diasNoMes; d++) labels.push(String(d));
  return { inicio, labels };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const periodo = searchParams.get("periodo") ?? "mensal";
  const { inicio, labels } = getIntervalo(periodo);

  const CONFIRMADOS = ["CONFIRMADO", "SEPARANDO", "ENVIADO", "CONCLUIDO"] as const;

  const [pedidosPeriodo, leadsPeriodo, pedidosVendedor, visitasEstado, pedidosTodos] =
    await Promise.all([
      // Pedidos no período
      prisma.pedido.findMany({
        where: { criadoEm: { gte: inicio } },
        select: { id: true, total: true, status: true, criadoEm: true },
      }),

      // Leads no período
      prisma.leadAtacado.count({ where: { criadoEm: { gte: inicio } } }),

      // Agrupamento por vendedor
      prisma.pedido.findMany({
        where: { criadoEm: { gte: inicio }, vendedorId: { not: null } },
        select: {
          total: true, status: true,
          vendedorId: true,
          vendedor: { select: { usuario: { select: { nome: true } } } },
        },
      }),

      // Visitas por estado
      prisma.visita.groupBy({
        by: ["estado"],
        where: { criadoEm: { gte: inicio }, estado: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 15,
      }),

      // Todos os pedidos no período para sparkline
      prisma.pedido.findMany({
        where: { criadoEm: { gte: inicio } },
        select: { total: true, status: true, criadoEm: true },
      }),
    ]);

  // Métricas gerais
  const faturamento = pedidosPeriodo
    .filter(p => CONFIRMADOS.includes(p.status as any))
    .reduce((acc, p) => acc + Number(p.total), 0);
  const totalPedidos = pedidosPeriodo.length;
  const ticketMedio = totalPedidos > 0 ? faturamento / totalPedidos : 0;

  // Melhores vendedores
  const mapVendedor = new Map<string, { nome: string; pedidos: number; faturamento: number; pendentes: number }>();
  for (const p of pedidosVendedor) {
    if (!p.vendedorId || !p.vendedor) continue;
    const id = p.vendedorId;
    const nome = (p.vendedor as any).usuario?.nome ?? "—";
    const entry = mapVendedor.get(id) ?? { nome, pedidos: 0, faturamento: 0, pendentes: 0 };
    entry.pedidos++;
    if (CONFIRMADOS.includes(p.status as any)) entry.faturamento += Number(p.total);
    if (p.status === "PENDENTE") entry.pendentes++;
    mapVendedor.set(id, entry);
  }
  const vendedores = Array.from(mapVendedor.values())
    .sort((a, b) => b.faturamento - a.faturamento)
    .slice(0, 10);

  // Sparkline — pedidos por label do período
  function getLabelIndex(data: Date): number {
    if (periodo === "diario") return data.getHours();
    if (periodo === "semanal") { const d = data.getDay(); return d === 0 ? 6 : d - 1; }
    if (periodo === "anual") return data.getMonth();
    return data.getDate() - 1;
  }

  const seriePedidos = new Array(labels.length).fill(0);
  const serieFaturamento = new Array(labels.length).fill(0);
  for (const p of pedidosTodos) {
    const idx = getLabelIndex(new Date(p.criadoEm));
    if (idx >= 0 && idx < labels.length) {
      seriePedidos[idx]++;
      if (CONFIRMADOS.includes(p.status as any)) serieFaturamento[idx] += Number(p.total);
    }
  }
  const serie = labels.map((label, i) => ({
    label,
    pedidos: seriePedidos[i],
    faturamento: serieFaturamento[i],
  }));

  // Visitas por estado com contagem de pedidos
  const visitasComPedidos = visitasEstado.map(v => ({
    estado: v.estado ?? "Desconhecido",
    visitas: v._count.id,
  }));

  return NextResponse.json({
    pedidos: totalPedidos,
    faturamento,
    ticketMedio,
    leads: leadsPeriodo,
    vendedores,
    visitasPorEstado: visitasComPedidos,
    serie,
  });
}
