import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dataInicio  = searchParams.get("dataInicio");
  const dataFim     = searchParams.get("dataFim");
  const estado      = searchParams.get("estado") ?? "";
  const cidade      = searchParams.get("cidade") ?? "";
  const catalogo    = searchParams.get("catalogo") ?? "";
  const vendedorId  = searchParams.get("vendedorId") ?? "";

  const where: any = {
    tipoEnvio: "EXCURSAO",
    ...(catalogo   ? { catalogo: catalogo as any } : {}),
    ...(vendedorId ? { vendedorId }                : {}),
    ...(dataInicio || dataFim
      ? {
          criadoEm: {
            ...(dataInicio ? { gte: new Date(dataInicio) } : {}),
            ...(dataFim    ? { lte: new Date(dataFim + "T23:59:59") } : {}),
          },
        }
      : {}),
  };

  // Filtros de excursão cadastrada (estado/cidade)
  if (estado || cidade) {
    where.excursao = {
      ...(estado ? { estado: { equals: estado, mode: "insensitive" } } : {}),
      ...(cidade ? { cidade: { contains: cidade, mode: "insensitive" } } : {}),
    };
  }

  const pedidos = await prisma.pedido.findMany({
    where,
    select: {
      id: true,
      total: true,
      excursaoId: true,
      excursaoTexto: true,
      excursao: { select: { id: true, nome: true } },
    },
  });

  const totalPedidos  = pedidos.length;
  const volumeTotal   = pedidos.reduce((s, p) => s + Number(p.total), 0);
  const atrelados     = pedidos.filter(p => p.excursaoId !== null).length;
  const naoAtrelados  = totalPedidos - atrelados;

  // Ranking de excursões cadastradas
  const rankingMap = new Map<string, { id: string; nome: string; pedidos: number; volume: number }>();
  for (const p of pedidos) {
    if (!p.excursaoId || !p.excursao) continue;
    const key = p.excursaoId;
    const entry = rankingMap.get(key) ?? { id: p.excursao.id, nome: p.excursao.nome, pedidos: 0, volume: 0 };
    entry.pedidos++;
    entry.volume += Number(p.total);
    rankingMap.set(key, entry);
  }
  const ranking = Array.from(rankingMap.values()).sort((a, b) => b.pedidos - a.pedidos);

  // Excursões não cadastradas — top nomes mais frequentes no excursaoTexto
  const naoRegistradasMap = new Map<string, number>();
  for (const p of pedidos) {
    if (p.excursaoId) continue; // já vinculada
    let nome = "";
    try { nome = JSON.parse(p.excursaoTexto ?? "").nome ?? ""; } catch { nome = p.excursaoTexto ?? ""; }
    if (!nome.trim()) continue;
    const normalized = nome.trim();
    naoRegistradasMap.set(normalized, (naoRegistradasMap.get(normalized) ?? 0) + 1);
  }
  const naoRegistradas = Array.from(naoRegistradasMap.entries())
    .map(([nome, count]) => ({ nome, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  return NextResponse.json({ totalPedidos, volumeTotal, atrelados, naoAtrelados, ranking, naoRegistradas });
}
