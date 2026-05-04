import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { nome, ativo, imagemUrl, bannerUrl } = body;

  const data: { nome?: string; ativo?: boolean; imagemUrl?: string | null; bannerUrl?: string | null } = {};
  if (nome !== undefined) data.nome = nome.trim();
  if (ativo !== undefined) data.ativo = ativo;
  if ("imagemUrl" in body) data.imagemUrl = imagemUrl || null;
  if ("bannerUrl" in body) data.bannerUrl = bannerUrl || null;

  const grupo = await prisma.grupo.update({ where: { id: params.id }, data });
  return NextResponse.json(grupo);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const count = await prisma.produto.count({ where: { grupoId: params.id } });
  if (count > 0) {
    return NextResponse.json(
      { erro: `Não é possível excluir: ${count} produto(s) vinculado(s) a esta categoria.` },
      { status: 400 }
    );
  }

  await prisma.grupo.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
