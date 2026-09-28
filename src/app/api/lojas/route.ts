import { withApiAccess } from "@/lib/api-access";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function GETHandler() {
  const lojas = await prisma.loja.findMany({
    where: { ativo: true },
    include: { vendedores: { include: { usuario: { select: { id: true, nome: true, email: true, ativo: true, perfil: true } } } } },
    orderBy: { nome: "asc" },
  });
  return NextResponse.json(lojas);
}

async function POSTHandler(request: NextRequest) {
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

export const GET = withApiAccess(GETHandler);
export const POST = withApiAccess(POSTHandler);
