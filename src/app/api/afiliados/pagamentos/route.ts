import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calcularTierAfiliado, calcularComissao } from "@/lib/afiliados";

// GET /api/afiliados/pagamentos?mes=2026-04
// Relatório mensal de comissão para o admin
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mes = searchParams.get("mes") ?? `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  const [ano, mesNum] = mes.split("-").map(Number);
  const inicioMes = new Date(ano, mesNum - 1, 1);
  const fimMes = new Date(ano, mesNum, 0, 23, 59, 59);

  const afiliados = await prisma.afiliado.findMany({
    where: { status: "APROVADO" },
    include: {
      usuario: { select: { nome: true } },
      pedidos: {
        where: {
          status: { in: ["CONFIRMADO", "ENVIADO", "CONCLUIDO"] },
          criadoEm: { gte: inicioMes, lte: fimMes },
        },
        select: { total: true },
      },
      pagamentos: {
        where: { periodo: mes },
      },
    },
    orderBy: { usuario: { nome: "asc" } },
  });

  const relatorio = afiliados.map(a => {
    const qtdPedidos = a.pedidos.length;
    const totalVendas = a.pedidos.reduce((acc, p) => acc + Number(p.total), 0);
    const { pct, nivel, faixa } = calcularTierAfiliado(qtdPedidos, a.tipo as "VAREJO" | "ATACADO");
    const comissao = calcularComissao(totalVendas, pct);
    const pagamento = a.pagamentos[0] ?? null;

    return {
      afiliadoId: a.id,
      nome: a.usuario.nome,
      slug: a.slug,
      qtdPedidos,
      totalVendas,
      tier: { pct, nivel, faixa },
      comissao,
      pagamentoId: pagamento?.id ?? null,
      statusPagamento: pagamento?.status ?? null,
      obsPagamento: pagamento?.obs ?? null,
    };
  });

  return NextResponse.json({ mes, relatorio });
}

// POST /api/afiliados/pagamentos — gerar/atualizar registro de pagamento
export async function POST(req: NextRequest) {
  const { afiliadoId, periodo, valor, qtdPedidos, obs } = await req.json();

  if (!afiliadoId || !periodo || valor === undefined) {
    return NextResponse.json({ erro: "afiliadoId, periodo e valor são obrigatórios." }, { status: 400 });
  }

  const pagamento = await prisma.pagamentoAfiliado.upsert({
    where: { afiliadoId_periodo: { afiliadoId, periodo } },
    update: { valor, qtdPedidos: qtdPedidos ?? 0, obs: obs || null },
    create: {
      afiliadoId,
      periodo,
      valor,
      qtdPedidos: qtdPedidos ?? 0,
      status: "PENDENTE",
      obs: obs || null,
    },
  });

  return NextResponse.json(pagamento);
}
