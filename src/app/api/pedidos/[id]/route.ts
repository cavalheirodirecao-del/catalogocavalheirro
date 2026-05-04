import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dispararWebhook } from "@/lib/webhook";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
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
  try {
    const body = await req.json();
  const { status, obs, excursaoId } = body;

    // Busca pedido atual com itens para calcular transições de estoque
    const atual = await prisma.pedido.findUnique({
      where: { id: params.id },
      include: { itens: true },
    });
    if (!atual) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

    if (status && status !== atual.status) {
      const de = atual.status;
      const para = status;
      const COMMITTED = ["CONFIRMADO", "SEPARANDO", "ENVIADO", "CONCLUIDO"];

      for (const item of atual.itens) {
        if (de === "PENDENTE" && COMMITTED.includes(para)) {
          // Confirma: debita físico e libera reserva
          await prisma.estoque.update({
            where: { varianteId: item.varianteId },
            data: {
              quantidade: { decrement: item.quantidade },
              pendente: { decrement: item.quantidade },
            },
          });
        } else if (de === "PENDENTE" && para === "CANCELADO") {
          // Cancela antes de confirmar: só libera reserva
          await prisma.estoque.update({
            where: { varianteId: item.varianteId },
            data: { pendente: { decrement: item.quantidade } },
          });
        } else if (COMMITTED.includes(de) && para === "CANCELADO") {
          // Cancela após confirmar: devolve ao estoque físico
          await prisma.estoque.update({
            where: { varianteId: item.varianteId },
            data: { quantidade: { increment: item.quantidade } },
          });
        }
      }
    }

    const pedido = await prisma.pedido.update({
      where: { id: params.id },
      data: {
        ...(status ? { status } : {}),
        ...(obs !== undefined ? { obs } : {}),
        ...("excursaoId" in body ? { excursaoId: excursaoId ?? null } : {}),
      },
    });

    // Webhook DataCrazy quando status muda
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

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.pedido.update({
    where: { id: params.id },
    data: { status: "CANCELADO" },
  });
  return NextResponse.json({ ok: true });
}
