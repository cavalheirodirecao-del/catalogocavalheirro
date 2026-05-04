import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatarMoeda } from "@/lib/utils";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const excursao = await prisma.excursao.findUnique({
    where: { id: params.id },
    include: {
      pedidos: {
        select: {
          id: true, numero: true, status: true, total: true, catalogo: true,
          criadoEm: true, nomeClienteAvulso: true, excursaoTexto: true,
          vendedor: { select: { usuario: { select: { nome: true } } } },
        },
        orderBy: { criadoEm: "desc" },
      },
    },
  });

  if (!excursao) return NextResponse.json({ erro: "Não encontrada." }, { status: 404 });

  const totalVolume = excursao.pedidos.reduce((acc, p) => acc + Number(p.total), 0);

  return NextResponse.json({
    ...excursao,
    stats: {
      totalPedidos: excursao.pedidos.length,
      totalVolume,
    },
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const {
    nome, telefone, estado, cidadesAtendidas,
    nomeResponsavel, telefoneResponsavel,
    cidade, setor, vaga, pontoReferencia, obs, ativo,
  } = body;

  const excursao = await prisma.excursao.update({
    where: { id: params.id },
    data: {
      ...(nome !== undefined ? { nome: nome.trim() } : {}),
      ...(telefone !== undefined ? { telefone: telefone || null } : {}),
      ...(estado !== undefined ? { estado: estado || null } : {}),
      ...(cidadesAtendidas !== undefined ? { cidadesAtendidas: cidadesAtendidas || null } : {}),
      ...(nomeResponsavel !== undefined ? { nomeResponsavel: nomeResponsavel || null } : {}),
      ...(telefoneResponsavel !== undefined ? { telefoneResponsavel: telefoneResponsavel || null } : {}),
      ...(cidade !== undefined ? { cidade: cidade || null } : {}),
      ...(setor !== undefined ? { setor: setor || null } : {}),
      ...(vaga !== undefined ? { vaga: vaga || null } : {}),
      ...(pontoReferencia !== undefined ? { pontoReferencia: pontoReferencia || null } : {}),
      ...(obs !== undefined ? { obs: obs || null } : {}),
      ...(ativo !== undefined ? { ativo } : {}),
    },
  });

  return NextResponse.json(excursao);
}
