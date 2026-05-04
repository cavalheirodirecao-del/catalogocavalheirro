import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const codigo = request.nextUrl.searchParams.get("codigo");
  if (!codigo) return NextResponse.json({ erro: "Código obrigatório." }, { status: 400 });

  const cupom = await prisma.cupom.findUnique({ where: { codigo } });

  if (!cupom || !cupom.ativo) {
    return NextResponse.json({ erro: "Cupom inválido ou inativo." }, { status: 400 });
  }
  if (cupom.validade && new Date() > cupom.validade) {
    return NextResponse.json({ erro: "Cupom expirado." }, { status: 400 });
  }
  if (cupom.usoMaximo !== null && cupom.usoAtual >= cupom.usoMaximo) {
    return NextResponse.json({ erro: "Cupom esgotado." }, { status: 400 });
  }

  return NextResponse.json({
    codigo: cupom.codigo,
    tipo: cupom.tipo,
    valor: cupom.valor ? Number(cupom.valor) : null,
  });
}
