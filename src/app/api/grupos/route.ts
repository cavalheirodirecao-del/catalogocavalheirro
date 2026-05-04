import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const admin = req.nextUrl.searchParams.get("admin") === "1";

  const grupos = await prisma.grupo.findMany({
    where: admin ? {} : { ativo: true },
    include: {
      subGrupos: {
        where: admin ? {} : { ativo: true },
        orderBy: { nome: "asc" },
      },
      _count: { select: { produtos: true } },
    },
    orderBy: { nome: "asc" },
  });
  return NextResponse.json(grupos);
}

export async function POST(request: NextRequest) {
  const { nome } = await request.json();
  if (!nome?.trim()) return NextResponse.json({ erro: "Nome obrigatório." }, { status: 400 });

  const grupo = await prisma.grupo.upsert({
    where: { nome: nome.trim() },
    update: {},
    create: { nome: nome.trim() },
    include: { subGrupos: true },
  });
  return NextResponse.json(grupo);
}
