import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const loja = await prisma.loja.findUnique({
    where: { id: params.id },
    include: { vendedores: { include: { usuario: true } } },
  });
  if (!loja) return NextResponse.json({ erro: "Não encontrado." }, { status: 404 });
  return NextResponse.json(loja);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { nome, endereco, cidade, horarioFuncionamento, ativo, vendedoresIds } = await request.json();

  const loja = await prisma.loja.update({
    where: { id: params.id },
    data: { nome, endereco, cidade, horarioFuncionamento, ativo },
  });

  // Atualiza associação de vendedores
  if (vendedoresIds) {
    await prisma.vendedor.updateMany({
      where: { lojaId: params.id },
      data: { lojaId: null },
    });
    if (vendedoresIds.length > 0) {
      await prisma.vendedor.updateMany({
        where: { id: { in: vendedoresIds } },
        data: { lojaId: params.id },
      });
    }
  }

  return NextResponse.json(loja);
}
