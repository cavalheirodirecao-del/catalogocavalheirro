import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tipo = searchParams.get("tipo");
  const produtoId = searchParams.get("produtoId");
  const dataInicio = searchParams.get("dataInicio");
  const dataFim = searchParams.get("dataFim");

  const where: any = {};
  if (tipo) where.tipo = tipo;
  if (produtoId) where.variante = { produtoId };
  if (dataInicio || dataFim) {
    where.criadoEm = {};
    if (dataInicio) where.criadoEm.gte = new Date(dataInicio);
    if (dataFim) {
      const fim = new Date(dataFim);
      fim.setHours(23, 59, 59, 999);
      where.criadoEm.lte = fim;
    }
  }

  const movimentacoes = await prisma.movimentacaoEstoque.findMany({
    where,
    include: {
      variante: {
        include: {
          produto: { select: { codigo: true, nome: true } },
          cor: { select: { nome: true } },
          gradeItem: { select: { valor: true } },
        },
      },
      usuario: { select: { nome: true } },
    },
    orderBy: { criadoEm: "desc" },
    take: 500,
  });

  return NextResponse.json(movimentacoes);
}
