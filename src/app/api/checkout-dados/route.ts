import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const telefone = searchParams.get("telefone");

  const [lojas, vendedores, configGeral] = await Promise.all([
    prisma.loja.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
    prisma.vendedor.findMany({
      where: { ativo: true, usuario: { perfil: { not: "AFILIADO" } } },
      include: { usuario: true },
      orderBy: { usuario: { nome: "asc" } },
    }),
    prisma.configuracaoGeral.findFirst(),
  ]);

  let primeiraCompra = false;
  if (telefone) {
    const normalizado = telefone.replace(/\D/g, "");
    if (normalizado.length >= 10) {
      const count = await prisma.pedido.count({
        where: { telefoneClienteAvulso: { contains: normalizado } },
      });
      primeiraCompra = count === 0;
    }
  }

  return NextResponse.json({
    lojas,
    vendedores,
    primeiraCompra,
    configGeral: configGeral
      ? {
          taxaExcursao: Number(configGeral.taxaExcursao),
          qtdMinimaAtacado: configGeral.qtdMinimaAtacado,
          qtdMinimaFabrica: configGeral.qtdMinimaFabrica,
        }
      : { taxaExcursao: 5, qtdMinimaAtacado: 15, qtdMinimaFabrica: 40 },
  });
}
