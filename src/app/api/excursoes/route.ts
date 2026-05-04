import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const busca  = searchParams.get("busca") ?? "";
  const estado = searchParams.get("estado") ?? "";
  const ativo  = searchParams.get("ativo");

  const excursoes = await prisma.excursao.findMany({
    where: {
      ...(busca  ? { OR: [{ nome: { contains: busca, mode: "insensitive" } }, { cidade: { contains: busca, mode: "insensitive" } }] } : {}),
      ...(estado ? { estado: { equals: estado, mode: "insensitive" } } : {}),
      ...(ativo !== null && ativo !== "" ? { ativo: ativo === "true" } : {}),
    },
    include: {
      _count: { select: { pedidos: true } },
    },
    orderBy: { nome: "asc" },
  });

  return NextResponse.json(excursoes);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    nome, telefone, estado, cidadesAtendidas,
    nomeResponsavel, telefoneResponsavel,
    cidade, setor, vaga, pontoReferencia, obs,
  } = body;

  if (!nome?.trim()) {
    return NextResponse.json({ erro: "Nome é obrigatório." }, { status: 400 });
  }

  const excursao = await prisma.excursao.create({
    data: {
      nome: nome.trim(),
      telefone: telefone || null,
      estado: estado || null,
      cidadesAtendidas: cidadesAtendidas || null,
      nomeResponsavel: nomeResponsavel || null,
      telefoneResponsavel: telefoneResponsavel || null,
      cidade: cidade || null,
      setor: setor || null,
      vaga: vaga || null,
      pontoReferencia: pontoReferencia || null,
      obs: obs || null,
    },
  });

  return NextResponse.json(excursao, { status: 201 });
}
