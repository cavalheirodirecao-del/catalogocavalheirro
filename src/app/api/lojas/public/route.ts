import { NextResponse } from "next/server";
import { withApiAccess } from "@/lib/api-access";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function GETHandler() {
  const lojas = await prisma.loja.findMany({ where: { ativo: true }, select: { id: true, nome: true, cidade: true }, orderBy: { nome: "asc" } });
  return NextResponse.json(lojas);
}

export const GET = withApiAccess(GETHandler);
