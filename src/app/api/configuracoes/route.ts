import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const config = await prisma.configuracaoGeral.findFirst();
  if (!config) return NextResponse.json(null);
  return NextResponse.json({
    taxaExcursao: Number(config.taxaExcursao),
    qtdMinimaAtacado: config.qtdMinimaAtacado,
    qtdMinimaFabrica: config.qtdMinimaFabrica,
    anuncioBarAtivo: config.anuncioBarAtivo,
    anuncioBarTexto: config.anuncioBarTexto,
    webhookAtivo: config.webhookAtivo,
    webhookDataCrazyUrl: config.webhookDataCrazyUrl,
    webhookDataCrazyToken: config.webhookDataCrazyToken,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    taxaExcursao, qtdMinimaAtacado, qtdMinimaFabrica,
    anuncioBarAtivo, anuncioBarTexto,
    webhookAtivo, webhookDataCrazyUrl, webhookDataCrazyToken,
  } = body;

  const existente = await prisma.configuracaoGeral.findFirst();

  const data: any = {};
  if (taxaExcursao !== undefined) data.taxaExcursao = taxaExcursao;
  if (qtdMinimaAtacado !== undefined) data.qtdMinimaAtacado = qtdMinimaAtacado;
  if (qtdMinimaFabrica !== undefined) data.qtdMinimaFabrica = qtdMinimaFabrica;
  if (anuncioBarAtivo !== undefined) data.anuncioBarAtivo = anuncioBarAtivo;
  if (anuncioBarTexto !== undefined) data.anuncioBarTexto = anuncioBarTexto;
  if (webhookAtivo !== undefined) data.webhookAtivo = webhookAtivo;
  if (webhookDataCrazyUrl !== undefined) data.webhookDataCrazyUrl = webhookDataCrazyUrl;
  if (webhookDataCrazyToken !== undefined) data.webhookDataCrazyToken = webhookDataCrazyToken;

  if (existente) {
    const atualizado = await prisma.configuracaoGeral.update({
      where: { id: existente.id },
      data,
    });
    return NextResponse.json(atualizado);
  }

  const novo = await prisma.configuracaoGeral.create({ data });
  return NextResponse.json(novo);
}
