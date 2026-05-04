import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const lead = await prisma.leadAtacado.findUnique({
    where: { id: params.id },
    select: { id: true, nome: true, status: true },
  });
  if (!lead) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(lead);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await req.json();
    const lead = await prisma.leadAtacado.update({
      where: { id: params.id },
      data: { status },
      select: { id: true, status: true },
    });
    return NextResponse.json(lead);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
