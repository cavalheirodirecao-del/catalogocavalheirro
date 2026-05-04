import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { nome } = await req.json();
  if (!nome?.trim()) return NextResponse.json({ erro: "Nome obrigatório." }, { status: 400 });

  const subGrupo = await prisma.subGrupo.create({
    data: {
      nome: nome.trim(),
      grupoId: params.id,
    },
  });
  return NextResponse.json(subGrupo);
}
