import { withApiAccess } from "@/lib/api-access";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

const PERFIS_ESTOQUE = ["ADMIN", "GERENTE", "ESTOQUISTA"];

async function GETHandler() {
  const produtos = await prisma.produto.findMany({
    where: { ativo: true },
    select: { id: true, codigo: true, nome: true, descricao: true, grupo: { select: { id: true, nome: true } }, subGrupo: { select: { id: true, nome: true } }, cores: { select: { nome: true, variantes: { select: { id: true, sku: true, gradeItem: { select: { valor: true, ordem: true } }, estoque: { select: { quantidade: true, pendente: true } } } } } } },
  });
  return NextResponse.json(produtos);
}

async function POSTHandler(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    if (!PERFIS_ESTOQUE.includes((token as any).perfil)) {
      return NextResponse.json({ error: "Sem permissão para movimentar estoque" }, { status: 403 });
    }

    const { varianteId, tipo, quantidade, obs, fornecedor, numeroDocumento, dataDocumento } = await req.json();

    if (!varianteId || !tipo || !quantidade) {
      return NextResponse.json({ error: "varianteId, tipo e quantidade são obrigatórios" }, { status: 400 });
    }

    const delta = tipo === "SAIDA" ? -Math.abs(quantidade) : Math.abs(quantidade);

    await prisma.$transaction([
      prisma.movimentacaoEstoque.create({
        data: {
          varianteId, tipo, quantidade: Math.abs(quantidade), usuarioId: token.sub as string,
          obs: obs || null,
          fornecedor: fornecedor || null,
          numeroDocumento: numeroDocumento || null,
          dataDocumento: dataDocumento ? new Date(dataDocumento) : null,
        },
      }),
      prisma.estoque.upsert({
        where: { varianteId },
        update: { quantidade: { increment: delta } },
        create: { varianteId, quantidade: delta },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export const POST = withApiAccess(POSTHandler);
export const GET = withApiAccess(GETHandler);
