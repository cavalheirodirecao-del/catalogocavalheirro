import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const config = await prisma.configuracaoGeral.findFirst();
  if (!config) return NextResponse.json(null);

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const isAdmin = (token as any)?.perfil === "ADMIN";

  return NextResponse.json({
    taxaExcursao: Number(config.taxaExcursao),
    qtdMinimaAtacado: config.qtdMinimaAtacado,
    qtdMinimaFabrica: config.qtdMinimaFabrica,
    anuncioBarAtivo: config.anuncioBarAtivo,
    anuncioBarTexto: config.anuncioBarTexto,
    webhookAtivo: config.webhookAtivo,
    webhookDataCrazyUrl: isAdmin ? config.webhookDataCrazyUrl : undefined,
    webhookDataCrazyToken: isAdmin ? config.webhookDataCrazyToken : undefined,
  });
}

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || (token as any).perfil !== "ADMIN") {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

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
