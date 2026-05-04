import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const grades = await prisma.grade.findMany({
    include: { itens: { orderBy: { ordem: "asc" } } },
    orderBy: { nome: "asc" },
  });
  return NextResponse.json(grades);
}

export async function POST(request: NextRequest) {
  const { nome, tipo, itens } = await request.json();
  if (!nome?.trim() || !tipo || !itens?.length) {
    return NextResponse.json({ erro: "Dados incompletos." }, { status: 400 });
  }

  const grade = await prisma.grade.create({
    data: {
      nome: nome.trim(),
      tipo,
      itens: {
        create: itens.map((valor: string, ordem: number) => ({ valor, ordem })),
      },
    },
    include: { itens: { orderBy: { ordem: "asc" } } },
  });
  return NextResponse.json(grade);
}
