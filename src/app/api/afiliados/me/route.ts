import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { calcularTierAfiliado, calcularComissao } from "@/lib/afiliados";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || (token as any).perfil !== "AFILIADO") {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const afiliado = await prisma.afiliado.findUnique({
    where: { usuarioId: token.id as string },
    include: {
      usuario: { select: { nome: true, email: true } },
      pagamentos: { orderBy: { periodo: "desc" }, take: 12 },
    },
  });

  if (!afiliado) return NextResponse.json({ erro: "Afiliado não encontrado." }, { status: 404 });

  // Vendas do mês atual
  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59);

  const pedidosMes = await prisma.pedido.findMany({
    where: {
      afiliadoId: afiliado.id,
      status: { in: ["CONFIRMADO", "ENVIADO", "CONCLUIDO"] },
      criadoEm: { gte: inicioMes, lte: fimMes },
    },
    select: {
      numero: true,
      total: true,
      status: true,
      criadoEm: true,
      catalogo: true,
      nomeClienteAvulso: true,
      telefoneClienteAvulso: true,
      cliente: { select: { nome: true } },
    },
    orderBy: { criadoEm: "desc" },
  });

  const qtdVendasMes = pedidosMes.length;
  const { pct, nivel, faixa, proximo } = calcularTierAfiliado(qtdVendasMes, afiliado.tipo as "VAREJO" | "ATACADO");
  const totalVendasMes = pedidosMes.reduce((acc, p) => acc + Number(p.total), 0);
  const comissaoMes = calcularComissao(totalVendasMes, pct);

  const pedidosFormatados = pedidosMes.map(p => ({
    numero: p.numero,
    total: Number(p.total),
    status: p.status,
    criadoEm: p.criadoEm,
    catalogo: p.catalogo,
    nomeCliente: p.cliente?.nome ?? p.nomeClienteAvulso ?? "—",
    comissao: calcularComissao(Number(p.total), pct),
  }));

  return NextResponse.json({
    id: afiliado.id,
    nome: afiliado.usuario.nome,
    email: afiliado.usuario.email,
    slug: afiliado.slug,
    status: afiliado.status,
    qtdVendasMes,
    totalVendasMes,
    comissaoMes,
    tipo: afiliado.tipo,
    tierAtual: { pct, nivel, faixa },
    proximo,
    pedidosMes: pedidosFormatados,
    pagamentos: afiliado.pagamentos,
  });
}
