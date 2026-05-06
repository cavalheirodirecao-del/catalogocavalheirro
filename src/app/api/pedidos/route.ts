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

  // Localiza cupom sem incrementar ainda (o incremento vai dentro da transação)
  let cupomId: string | null = null;
  let cupomEncontrado: { id: string } | null = null;
  if (cupomCodigo) {
    cupomEncontrado = await prisma.cupom.findUnique({ where: { codigo: cupomCodigo } });
    if (cupomEncontrado) cupomId = cupomEncontrado.id;
  }

  let linkVendedorId: string | null = null;
  if (vendedorId) {
    const link = await prisma.linkVendedor.findUnique({
      where: { vendedorId_catalogo: { vendedorId, catalogo } },
    });
    linkVendedorId = link?.id ?? null;
  }

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

  // Transação atômica: valida estoque → cria pedido → reserva pendente
  let pedido;
  try {
    pedido = await prisma.$transaction(async (tx) => {
      // 1. Verifica disponível para cada item
      const varianteIds = itens.map((i: any) => i.varianteId);
      const estoques = await tx.estoque.findMany({ where: { varianteId: { in: varianteIds } } });

      const insuficientes = itens
        .filter((item: any) => {
          const e = estoques.find((e: any) => e.varianteId === item.varianteId);
          return Math.max(0, (e?.quantidade ?? 0) - (e?.pendente ?? 0)) < item.quantidade;
        })
        .map((item: any) => {
          const e = estoques.find((e: any) => e.varianteId === item.varianteId);
          return {
            varianteId: item.varianteId,
            disponivel: Math.max(0, (e?.quantidade ?? 0) - (e?.pendente ?? 0)),
            solicitado: item.quantidade,
          };
        });

      if (insuficientes.length > 0) {
        const err: any = new Error("ESTOQUE_INSUFICIENTE");
        err.itensInsuficientes = insuficientes;
        throw err;
      }

      // 2. Incrementa uso do cupom (dentro da transação para consistência)
      if (cupomEncontrado) {
        await tx.cupom.update({
          where: { id: cupomEncontrado.id },
          data: { usoAtual: { increment: 1 } },
        });
      }

      // 3. Cria pedido + itens
      const novoPedido = await tx.pedido.create({
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

      // 4. Reserva estoque (pendente) — físico só debita ao confirmar pedido
      for (const item of itens) {
        await tx.estoque.upsert({
          where: { varianteId: item.varianteId },
          update: { pendente: { increment: item.quantidade } },
          create: { varianteId: item.varianteId, quantidade: 0, pendente: item.quantidade },
        });
      }

      return novoPedido;
    });
  } catch (err: any) {
    if (err?.message === "ESTOQUE_INSUFICIENTE") {
      return NextResponse.json(
        { erro: "Estoque insuficiente para alguns itens.", itensInsuficientes: err.itensInsuficientes },
        { status: 409 }
      );
    }
    throw err;
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
