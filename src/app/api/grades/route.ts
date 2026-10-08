import { withApiAccess } from "@/lib/api-access";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function GETHandler(request: NextRequest) {
  const grades = await prisma.grade.findMany({
    where: request.nextUrl.searchParams.get("admin") === "1" ? {} : { ativo: true },
    include: { itens: { orderBy: { ordem: "asc" } } },
    orderBy: { nome: "asc" },
  });
  return NextResponse.json(grades);
}

async function POSTHandler(request: NextRequest) {
  const { nome, tipo, itens } = await request.json();
  if (!nome?.trim() || !tipo || !itens?.length) {
    return NextResponse.json({ erro: "Dados incompletos." }, { status: 400 });
  }

  const grade = await prisma.grade.create({
    data: {
      nome: nome.trim(),
      tipo,
      itens: {
        create: itens.map((valor: string, ordem: number) => ({ valor, ordem })),
      },
    },
    include: { itens: { orderBy: { ordem: "asc" } } },
  });
  return NextResponse.json(grade);
}

export const GET = withApiAccess(GETHandler);
export const POST = withApiAccess(POSTHandler);

async function PATCHHandler(request: NextRequest) {
  const body = await request.json();
  if (!body.id || !body.nome?.trim()) return NextResponse.json({ erro: "Informe a grade e o nome." }, { status: 400 });
  try {
    const grade = await prisma.grade.update({ where: { id: body.id }, data: { nome: body.nome.trim(), ...(body.ativo !== undefined ? { ativo: Boolean(body.ativo) } : {}) }, include: { itens: { orderBy: { ordem: "asc" } } } });
    return NextResponse.json(grade);
  } catch { return NextResponse.json({ erro: "Grade não encontrada ou nome já utilizado." }, { status: 409 }); }
}

async function DELETEHandler(request: NextRequest) {
  const { id } = await request.json();
  if (!id) return NextResponse.json({ erro: "Informe a grade." }, { status: 400 });
  const uso = await prisma.produto.count({ where: { gradeId: id } });
  if (uso) return NextResponse.json({ erro: "Não é possível excluir: a grade está relacionada a produtos. Inative-a." }, { status: 409 });
  await prisma.gradeItem.deleteMany({ where: { gradeId: id } });
  await prisma.grade.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export const PATCH = withApiAccess(PATCHHandler);
export const DELETE = withApiAccess(DELETEHandler);
