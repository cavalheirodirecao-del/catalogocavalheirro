import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { dispararWebhook } from "@/lib/webhook";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const catalogo = searchParams.get("catalogo");

  const pedidos = await prisma.pedido.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(catalogo ? { catalogo: catalogo as any } : {}),
    },
    include: {
      cliente: true,
      vendedor: { include: { usuario: true } },
      itens: { include: { variante: { include: { produto: true, cor: true, gradeItem: true } } } },
      lojaRetirada: true,
      excursao: { select: { id: true, nome: true } },
    },
    orderBy: { criadoEm: "desc" },
  });

  return NextResponse.json(pedidos);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    catalogo, vendedorId,
    nomeCliente, telefoneCliente,
    tipoEnvio, lojaRetiradaId, excursaoTexto, enderecoEntrega,
    valorFrete, formaPagamento,
    cupomCodigo, desconto, total, obs, itens,
    refSlug,
  } = body;

  let cupomId: string | null = null;
  if (cupomCodigo) {
    const cupom = await prisma.cupom.findUnique({ where: { codigo: cupomCodigo } });
    if (cupom) {
      cupomId = cupom.id;
      await prisma.cupom.update({
        where: { id: cupom.id },
        data: { usoAtual: { increment: 1 } },
      });
    }
  }

  let linkVendedorId: string | null = null;
  if (vendedorId) {
    const link = await prisma.linkVendedor.findUnique({
      where: { vendedorId_catalogo: { vendedorId, catalogo } },
    });
    linkVendedorId = link?.id ?? null;
  }

  // Resolve refSlug → afiliado (last-touch attribution)
  let afiliadoId: string | null = null;
  let tipoSlugResolvido: "AFILIADO" | "VENDEDOR" | null = null;
  if (refSlug) {
    const afiliado = await prisma.afiliado.findFirst({
      where: { slug: refSlug, status: "APROVADO" },
    });
    if (afiliado) {
      afiliadoId = afiliado.id;
      tipoSlugResolvido = "AFILIADO";
    } else {
      tipoSlugResolvido = "VENDEDOR";
    }
  }

  const pedido = await prisma.pedido.create({
    data: {
      catalogo,
      vendedorId: vendedorId || null,
      linkVendedorId,
      afiliadoId,
      nomeClienteAvulso: nomeCliente,
      telefoneClienteAvulso: telefoneCliente,
      tipoEnvio,
      lojaRetiradaId: lojaRetiradaId || null,
      excursaoTexto: excursaoTexto || null,
      enderecoEntrega: enderecoEntrega || null,
      valorFrete,
      cupomId,
      desconto,
      formaPagamento,
      total,
      obs: obs || null,
      status: "PENDENTE",
      itens: {
        create: itens.map((i: any) => ({
          varianteId: i.varianteId,
          quantidade: i.quantidade,
          precoUnitario: i.precoUnitario,
          subtotal: i.subtotal,
        })),
      },
    },
  });

  // Reserva estoque (pendente) — o físico só é debitado ao confirmar o pedido
  for (const item of itens) {
    await prisma.estoque.upsert({
      where: { varianteId: item.varianteId },
      update: { pendente: { increment: item.quantidade } },
      create: { varianteId: item.varianteId, quantidade: 0, pendente: item.quantidade },
    });
  }

  // Atualiza slugAtual no Cliente por telefone (fire-and-forget)
  if (refSlug && tipoSlugResolvido && telefoneCliente) {
    const telNorm = String(telefoneCliente).replace(/\D/g, "");
    prisma.cliente.findFirst({ where: { telefone: { contains: telNorm } } })
      .then(cliente => {
        if (!cliente) return;
        return prisma.cliente.update({
          where: { id: cliente.id },
          data: {
            slugAtual: refSlug,
            tipoSlugAtual: tipoSlugResolvido as any,
            slugLogs: {
              create: {
                slug: refSlug,
                tipo: tipoSlugResolvido as any,
                origem: "checkout",
              },
            },
          },
        });
      })
      .catch(() => {});
  }

  // Webhook DataCrazy (fire-and-forget)
  dispararWebhook("pedido.criado", {
    numero: pedido.numero,
    status: pedido.status,
    catalogo: pedido.catalogo,
    cliente: nomeCliente ?? null,
    telefone: telefoneCliente ?? null,
    total: Number(pedido.total),
    frete: Number(pedido.valorFrete),
    formaPagamento: pedido.formaPagamento,
    tipoEnvio: pedido.tipoEnvio,
    criadoEm: pedido.criadoEm.toISOString(),
  });

  return NextResponse.json({ id: pedido.id, numero: pedido.numero });
}
