import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const lojas = await prisma.loja.findMany({
    where: { ativo: true },
    include: { vendedores: { include: { usuario: true } } },
    orderBy: { nome: "asc" },
  });
  return NextResponse.json(lojas);
}

export async function POST(request: NextRequest) {
  const { nome, endereco, cidade, horarioFuncionamento, vendedoresIds } = await request.json();

  const loja = await prisma.loja.create({
    data: { nome, endereco: endereco || null, cidade, horarioFuncionamento: horarioFuncionamento || null },
  });

  if (vendedoresIds?.length > 0) {
    await prisma.vendedor.updateMany({
      where: { id: { in: vendedoresIds } },
      data: { lojaId: loja.id },
    });
  }

  return NextResponse.json(loja);
}
