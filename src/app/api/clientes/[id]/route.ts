import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const cliente = await prisma.cliente.findUnique({ where: { id: params.id } });
  if (!cliente) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(cliente);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { nome, documento, email, telefone, endereco, cidade, estado, tipo, ativo } = body;

    const cliente = await prisma.cliente.update({
      where: { id: params.id },
      data: {
        nome,
        documento: documento || null,
        email: email || null,
        telefone: telefone || null,
        endereco: endereco || null,
        cidade: cidade || null,
        estado: estado || null,
        tipo,
        ativo,
      },
    });

    return NextResponse.json(cliente);
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.cliente.update({ where: { id: params.id }, data: { ativo: false } });
  return NextResponse.json({ ok: true });
}
