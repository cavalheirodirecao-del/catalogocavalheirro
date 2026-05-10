import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { dispararWebhook } from "@/lib/webhook";

const PERFIS_OPERADORES = ["ADMIN", "GERENTE", "ESTOQUISTA"];

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const pedido = await prisma.pedido.findUnique({
    where: { id: params.id },
    include: {
      cliente: true,
      vendedor: { include: { usuario: true } },
      lojaRetirada: true,
      cupom: true,
      excursao: true,
      itens: {
        include: {
          variante: {
            include: {
              produto: true,
              cor: { include: { imagens: { orderBy: { ordem: "asc" } } } },
              gradeItem: true,
            },
          },
        },
      },
    },
  });
  if (!pedido) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(pedido);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !PERFIS_OPERADORES.includes((token as any).perfil)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { status, obs, excursaoId } = body;

    const atual = await prisma.pedido.findUnique({
      where: { id: params.id },
      include: { itens: true },
    });
    if (!atual) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

    const pedido = await prisma.$transaction(async (tx) => {
      if (status && status !== atual.status) {
        const de = atual.status;
        const para = status;
        const COMMITTED = ["CONFIRMADO", "SEPARANDO", "ENVIADO", "CONCLUIDO"];

        for (const item of atual.itens) {
          if (de === "PENDENTE" && COMMITTED.includes(para)) {
            await tx.estoque.update({
              where: { varianteId: item.varianteId },
              data: {
                quantidade: { decrement: item.quantidade },
                pendente: { decrement: item.quantidade },
              },
            });
          } else if (de === "PENDENTE" && para === "CANCELADO") {
            await tx.estoque.update({
              where: { varianteId: item.varianteId },
              data: { pendente: { decrement: item.quantidade } },
            });
          } else if (COMMITTED.includes(de) && para === "CANCELADO") {
            await tx.estoque.update({
              where: { varianteId: item.varianteId },
              data: { quantidade: { increment: item.quantidade } },
            });
          }
        }
      }

      return tx.pedido.update({
        where: { id: params.id },
        data: {
          ...(status ? { status } : {}),
          ...(obs !== undefined ? { obs } : {}),
          ...("excursaoId" in body ? { excursaoId: excursaoId ?? null } : {}),
        },
      });
    });

    if (status && status !== atual.status) {
      dispararWebhook("pedido.status_atualizado", {
        numero: pedido.numero,
        status: pedido.status,
        catalogo: pedido.catalogo,
        cliente: pedido.nomeClienteAvulso ?? null,
        telefone: pedido.telefoneClienteAvulso ?? null,
        total: Number(pedido.total),
        frete: Number(pedido.valorFrete),
        formaPagamento: pedido.formaPagamento,
        tipoEnvio: pedido.tipoEnvio,
        criadoEm: pedido.criadoEm.toISOString(),
      });
    }

    return NextResponse.json(pedido);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || (token as any).perfil !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  await prisma.pedido.update({
    where: { id: params.id },
    data: { status: "CANCELADO" },
  });
  return NextResponse.json({ ok: true });
}
