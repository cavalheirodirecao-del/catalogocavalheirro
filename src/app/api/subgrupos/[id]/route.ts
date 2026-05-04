import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { nome, ativo } = await req.json();

  const data: { nome?: string; ativo?: boolean } = {};
  if (nome !== undefined) data.nome = nome.trim();
  if (ativo !== undefined) data.ativo = ativo;

  const subGrupo = await prisma.subGrupo.update({ where: { id: params.id }, data });
  return NextResponse.json(subGrupo);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const count = await prisma.produto.count({ where: { subGrupoId: params.id } });
  if (count > 0) {
    return NextResponse.json(
      { erro: `Não é possível excluir: ${count} produto(s) vinculado(s) a esta subcategoria.` },
      { status: 400 }
    );
  }

  await prisma.subGrupo.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
