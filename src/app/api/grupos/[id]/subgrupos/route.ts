import { withApiAccess } from "@/lib/api-access";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function POSTHandler(req: NextRequest, { params }: { params: { id: string } }) {
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

export const POST = withApiAccess(POSTHandler);
