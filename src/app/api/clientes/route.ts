import { withApiAccess } from "@/lib/api-access";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function GETHandler() {
  const clientes = await prisma.cliente.findMany({
    orderBy: { nome: "asc" },
    include: { _count: { select: { pedidos: true } } },
  });
  return NextResponse.json(clientes);
}

async function POSTHandler(req: Request) {
  try {
    const body = await req.json();
    const { nome, documento, email, telefone, endereco, cidade, estado, tipo } = body;

    if (!nome || !tipo) {
      return NextResponse.json({ error: "Nome e tipo são obrigatórios" }, { status: 400 });
    }

    const cliente = await prisma.cliente.create({
      data: {
        nome,
        documento: documento || null,
        email: email || null,
        telefone: telefone || null,
        endereco: endereco || null,
        cidade: cidade || null,
        estado: estado || null,
        tipo,
        ativo: true,
      },
    });

    return NextResponse.json(cliente, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export const GET = withApiAccess(GETHandler);
export const POST = withApiAccess(POSTHandler);
