import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const job = await prisma.catalogoJob.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ erro: "Job não encontrado." }, { status: 404 });
  return NextResponse.json(job);
}
