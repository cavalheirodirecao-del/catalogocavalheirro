import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const lojas = await prisma.loja.findMany({ where: { ativo: true }, select: { id: true, nome: true, cidade: true }, orderBy: { nome: "asc" } });
  return NextResponse.json(lojas);
}
