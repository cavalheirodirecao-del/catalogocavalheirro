import { withApiAccess } from "@/lib/api-access";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function GETHandler(_: NextRequest, { params }: { params: { id: string } }) {
  const lead = await prisma.leadAtacado.findUnique({
    where: { id: params.id },
    select: { id: true, status: true },
  });
  if (!lead) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(lead);
}

async function PATCHHandler(req: NextRequest, { params }: { params: { id: string } }) {
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

export const GET = withApiAccess(GETHandler);
export const PATCH = withApiAccess(PATCHHandler);
