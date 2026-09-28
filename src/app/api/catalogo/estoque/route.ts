import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApiAccess } from "@/lib/api-access";

export const dynamic = "force-dynamic";

export const GET = withApiAccess(async () => {
  const variantes = await prisma.produtoVariante.findMany({
    where: { ativo: true, produto: { ativo: true }, cor: { ativo: true } },
    select: { id: true, estoque: { select: { quantidade: true, pendente: true } } },
  });
  return NextResponse.json(Object.fromEntries(variantes.map(v => [
    v.id, Math.max(0, (v.estoque?.quantidade ?? 0) - (v.estoque?.pendente ?? 0)),
  ])));
});
