import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cupons = await prisma.cupom.findMany({ orderBy: { criadoEm: "desc" } });
  return NextResponse.json(cupons);
}

export async function POST(request: NextRequest) {
  const { codigo, tipo, valor, validade, usoMaximo } = await request.json();

  const cupom = await prisma.cupom.create({
    data: {
      codigo: codigo.toUpperCase().trim(),
      tipo,
      valor: valor !== "" && valor !== null ? valor : null,
      validade: validade ? new Date(validade) : null,
      usoMaximo: usoMaximo !== "" && usoMaximo !== null ? Number(usoMaximo) : null,
    },
  });
  return NextResponse.json(cupom);
}
