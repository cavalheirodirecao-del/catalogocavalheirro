import { withApiAccess } from "@/lib/api-access";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function GETHandler(_req: NextRequest, { params }: { params: { id: string } }) {
  const job = await prisma.catalogoJob.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ erro: "Job não encontrado." }, { status: 404 });
  return NextResponse.json(job);
}

export const GET = withApiAccess(GETHandler);
