import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

  const cupons = await prisma.cupom.findMany({ orderBy: { criadoEm: "desc" } });
  return NextResponse.json(cupons);
}

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || (token as any).perfil !== "ADMIN") {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const { codigo, tipo, valor, validade, usoMaximo } = await request.json();

  if (!codigo || !tipo) {
    return NextResponse.json({ erro: "Código e tipo são obrigatórios." }, { status: 400 });
  }

  // Valida percentual não ultrapassa 100%
  const valorNum = valor !== "" && valor !== null ? Number(valor) : null;
  if (tipo === "PERCENTUAL" && valorNum !== null && (valorNum <= 0 || valorNum > 100)) {
    return NextResponse.json({ erro: "Percentual deve ser entre 1 e 100." }, { status: 400 });
  }

  // Valida data de validade não é passada
  if (validade) {
    const dataValidade = new Date(validade);
    if (dataValidade < new Date()) {
      return NextResponse.json({ erro: "A data de validade não pode ser no passado." }, { status: 400 });
    }
  }

  const usoMaximoNum = usoMaximo !== "" && usoMaximo !== null ? Number(usoMaximo) : null;
  if (usoMaximoNum !== null && usoMaximoNum < 1) {
    return NextResponse.json({ erro: "Uso máximo deve ser pelo menos 1." }, { status: 400 });
  }

  const cupom = await prisma.cupom.create({
    data: {
      codigo: codigo.toUpperCase().trim(),
      tipo,
      valor: valorNum,
      validade: validade ? new Date(validade) : null,
      usoMaximo: usoMaximoNum,
    },
  });
  return NextResponse.json(cupom);
}
