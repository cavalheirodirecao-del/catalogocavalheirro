import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const cupom = await prisma.cupom.findUnique({ where: { id: params.id } });
  if (!cupom) return NextResponse.json({ erro: "Não encontrado." }, { status: 404 });
  return NextResponse.json(cupom);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { codigo, tipo, valor, validade, usoMaximo, ativo } = await request.json();
  const cupom = await prisma.cupom.update({
    where: { id: params.id },
    data: {
      codigo,
      tipo,
      valor: valor !== "" && valor !== null ? valor : null,
      validade: validade ? new Date(validade) : null,
      usoMaximo: usoMaximo !== "" && usoMaximo !== null ? Number(usoMaximo) : null,
      ativo,
    },
  });
  return NextResponse.json(cupom);
}
