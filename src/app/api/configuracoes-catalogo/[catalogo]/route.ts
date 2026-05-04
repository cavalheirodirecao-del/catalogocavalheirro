import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TipoCatalogo } from "@prisma/client";

const TIPOS_VALIDOS = ["VAREJO", "ATACADO", "FABRICA"];

const TITULOS_PADRAO: Record<TipoCatalogo, string> = {
  VAREJO: "Varejo",
  ATACADO: "Atacado Revenda",
  FABRICA: "Atacado Grandes Clientes",
};

export async function GET(_req: NextRequest, { params }: { params: { catalogo: string } }) {
  const catalogo = params.catalogo.toUpperCase() as TipoCatalogo;

  if (!TIPOS_VALIDOS.includes(catalogo)) {
    return NextResponse.json({ erro: "Catálogo inválido" }, { status: 400 });
  }

  const config = await prisma.configuracaoCatalogo.upsert({
    where: { catalogo },
    update: {},
    create: { catalogo, titulo: TITULOS_PADRAO[catalogo] },
  });

  return NextResponse.json(config);
}

export async function PATCH(req: NextRequest, { params }: { params: { catalogo: string } }) {
  const catalogo = params.catalogo.toUpperCase() as TipoCatalogo;

  if (!TIPOS_VALIDOS.includes(catalogo)) {
    return NextResponse.json({ erro: "Catálogo inválido" }, { status: 400 });
  }

  const body = await req.json();
  const data: Partial<{
    imagemCapa: string | null;
    titulo: string;
    descricao: string | null;
    logoUrl: string | null;
    corPrimaria: string | null;
    corSecundaria: string | null;
  }> = {};

  if ("imagemCapa" in body) data.imagemCapa = body.imagemCapa || null;
  if ("titulo" in body) data.titulo = body.titulo;
  if ("descricao" in body) data.descricao = body.descricao || null;
  if ("logoUrl" in body) data.logoUrl = body.logoUrl || null;
  if ("corPrimaria" in body) data.corPrimaria = body.corPrimaria || null;
  if ("corSecundaria" in body) data.corSecundaria = body.corSecundaria || null;

  const config = await prisma.configuracaoCatalogo.upsert({
    where: { catalogo },
    update: data,
    create: { catalogo, titulo: TITULOS_PADRAO[catalogo], ...data },
  });

  return NextResponse.json(config);
}
