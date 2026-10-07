import { withApiAccess } from "@/lib/api-access";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function GETHandler(req: NextRequest) {
  const admin = req.nextUrl.searchParams.get("admin") === "1";

  const grupos = await prisma.grupo.findMany({
    where: admin ? {} : { ativo: true },
    select: {
      id: true, nome: true, ativo: true, imagemUrl: true, bannerUrl: true,
      subGrupos: { where: admin ? {} : { ativo: true }, orderBy: { nome: "asc" }, select: { id: true, grupoId: true, nome: true, ativo: true } },
      _count: { select: { produtos: true } },
    },
    orderBy: { nome: "asc" },
  });
  return NextResponse.json(grupos);
}

async function POSTHandler(request: NextRequest) {
  const { nome } = await request.json();
  if (!nome?.trim()) return NextResponse.json({ erro: "Nome obrigatório." }, { status: 400 });

  const grupo = await prisma.grupo.upsert({
    where: { nome: nome.trim() },
    update: {},
    create: { nome: nome.trim() },
    select: { id: true, nome: true, ativo: true, imagemUrl: true, bannerUrl: true, subGrupos: { select: { id: true, grupoId: true, nome: true, ativo: true } } },
  });
  return NextResponse.json(grupo);
}

export const GET = withApiAccess(GETHandler);
export const POST = withApiAccess(POSTHandler);
