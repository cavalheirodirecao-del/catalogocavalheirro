import { exclusiveAccess } from "@/lib/exclusive-access";
import { withApiAccess } from "@/lib/api-access";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readReferral, resolveReferral } from "@/lib/tracking";

async function GETHandler(req: NextRequest) {
  const catalogo = req.nextUrl.searchParams.get("catalogo") ?? "VAREJO";
  if (!["VAREJO", "ATACADO", "FABRICA"].includes(catalogo)) return NextResponse.json({ erro: "Catálogo inválido." }, { status: 400 });
  const telefone = req.nextUrl.searchParams.get("telefone")?.replace(/\D/g, "");
  const [lojas, vendedores, configGeral, ref] = await Promise.all([
    prisma.loja.findMany({ where: { ativo: true }, select: { id: true, nome: true, cidade: true, endereco: true }, orderBy: { nome: "asc" } }),
    prisma.vendedor.findMany({
      where: { ativo: true, usuario: { ativo: true, perfil: { not: "AFILIADO" } }, links: { some: { catalogo: catalogo as any, ativo: true } } },
      select: { id: true, slug: true, telefone: true, usuario: { select: { nome: true } } }, orderBy: { usuario: { nome: "asc" } },
    }),
    prisma.configuracaoGeral.findFirst(),
    resolveReferral(await readReferral(req), catalogo as any),
  ]);
  const primeiraCompra = !!telefone && telefone.length >= 10 && await prisma.pedido.count({ where: { telefoneClienteAvulso: telefone, status: { not: "CANCELADO" } } }) === 0;
  return NextResponse.json({
    clienteExclusivo: catalogo === "FABRICA" ? await exclusiveAccess(req) : null,
    lojas, vendedores, primeiraCompra, vendedorVinculado: ref?.vendedor ?? null,
    configGeral: { taxaExcursao: Number(configGeral?.taxaExcursao ?? 5), qtdMinimaAtacado: configGeral?.qtdMinimaAtacado ?? 15, qtdMinimaFabrica: configGeral?.qtdMinimaFabrica ?? 40 },
  });
}

export const GET = withApiAccess(GETHandler);
