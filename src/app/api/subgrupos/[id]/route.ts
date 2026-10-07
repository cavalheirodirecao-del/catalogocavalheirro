import { withApiAccess } from "@/lib/api-access";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function PATCHHandler(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { nome, ativo, ordem, slug, titulo, iconeUrl } = body;

  const data: { nome?: string; ativo?: boolean; ordem?: number; slug?: string | null; titulo?: string | null; iconeUrl?: string | null } = {};
  if (nome !== undefined) data.nome = nome.trim();
  if (ativo !== undefined) data.ativo = ativo;
  if (ordem !== undefined) data.ordem = Number(ordem) || 0;
  if ("slug" in body) data.slug = slug?.trim() || null;
  if ("titulo" in body) data.titulo = titulo?.trim() || null;
  if ("iconeUrl" in body) data.iconeUrl = iconeUrl?.trim() || null;

  const subGrupo = await prisma.subGrupo.update({ where: { id: params.id }, data });
  return NextResponse.json(subGrupo);
}

async function DELETEHandler(_req: NextRequest, { params }: { params: { id: string } }) {
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

export const PATCH = withApiAccess(PATCHHandler);
export const DELETE = withApiAccess(DELETEHandler);
