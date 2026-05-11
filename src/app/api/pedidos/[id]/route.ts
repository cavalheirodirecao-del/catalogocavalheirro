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
    const { status, obs, excursaoId, restaurarEstoque } = body;

    const atual = await prisma.pedido.findUnique({
      where: { id: params.id },
      include: { itens: true },
    });
    if (!atual) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

    const pedido = await prisma.$transaction(async (tx) => {
      if (status && status !== atual.status) {
        const de = atual.status;
        const para = status;
        const PRE_CONCLUIDO = ["PENDENTE", "CONFIRMADO", "SEPARANDO", "ENVIADO"];

        const estoques = await tx.estoque.findMany({
          where: { varianteId: { in: atual.itens.map(i => i.varianteId) } },
        });

        for (const item of atual.itens) {
          const est = estoques.find(e => e.varianteId === item.varianteId);
          // estaReservado=true → pedido criado no novo modelo (pendente ainda não liberado)
          // estaReservado=false → pedido antigo (pendente já foi zerado ao confirmar)
          const estaReservado = (est?.pendente ?? 0) >= item.quantidade;

          if (PRE_CONCLUIDO.includes(de) && para === "CONCLUIDO") {
            if (estaReservado) {
              // Novo modelo: baixa o estoque físico apenas quando concluído
              await tx.estoque.update({
                where: { varianteId: item.varianteId },
                data: {
                  quantidade: { decrement: item.quantidade },
                  pendente: { decrement: item.quantidade },
                },
              });
            }
            // Pedido antigo (pendente=0, quantidade já debitada ao confirmar) — não faz nada
          } else if (para === "CANCELADO" && restaurarEstoque) {
            if (de === "CONCLUIDO") {
              // Devolve estoque físico (foi debitado no CONCLUIDO)
              await tx.estoque.update({
                where: { varianteId: item.varianteId },
                data: { quantidade: { increment: item.quantidade } },
              });
            } else if (PRE_CONCLUIDO.includes(de)) {
              if (estaReservado) {
                // Libera reserva do novo modelo
                await tx.estoque.update({
                  where: { varianteId: item.varianteId },
                  data: { pendente: { decrement: item.quantidade } },
                });
              } else {
                // Pedido antigo: quantidade foi debitada ao confirmar → devolve
                await tx.estoque.update({
                  where: { varianteId: item.varianteId },
                  data: { quantidade: { increment: item.quantidade } },
                });
              }
            }
          }
          // Demais transições (PENDENTE→CONFIRMADO etc.): nenhuma mudança de estoque
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
