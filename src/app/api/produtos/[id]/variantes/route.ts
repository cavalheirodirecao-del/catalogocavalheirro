import { withApiAccess, currentActor } from "@/lib/api-access";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
async function handler(req: NextRequest, { params }: { params: { id: string } }) {
  const actor = await currentActor(req); if (!actor || !["ADMIN", "GERENTE", "ESTOQUISTA"].includes(actor.perfil)) return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });
  const b = await req.json(); const gradeId = String(b.gradeId ?? ""); const cores: string[] = Array.isArray(b.corGlobalIds) ? b.corGlobalIds : [];
  const grade = await prisma.grade.findUnique({ where: { id: gradeId }, include: { itens: { orderBy: { ordem: "asc" } } } }); if (!grade || !cores.length) return NextResponse.json({ erro: "Escolha uma grade e ao menos uma cor." }, { status: 400 });
  const produto = await prisma.produto.findUnique({ where: { id: params.id }, include: { cores: { include: { variantes: true } } } }); if (!produto) return NextResponse.json({ erro: "Produto não encontrado." }, { status: 404 });
  const globais = await prisma.corGlobal.findMany({ where: { id: { in: cores }, ativo: true } });
  const existentes = produto.cores.flatMap(c => c.variantes.map(v => `${c.corGlobalId ?? c.nome.toUpperCase()}::${v.gradeItemId}`));
  const combinacoes = globais.flatMap(c => grade.itens.map(i => ({ corGlobalId: c.id, cor: c.nome, gradeItemId: i.id, tamanho: i.valor, existente: existentes.includes(`${c.id}::${i.id}`) })));
  if (b.acao === "validar") return NextResponse.json({ grade: { id: grade.id, nome: grade.nome }, combinacoes });
  const novas = combinacoes.filter(c => !c.existente); const resultado = await prisma.$transaction(async tx => { for (const c of novas) { let cor = await tx.produtoCor.findFirst({ where: { produtoId: params.id, corGlobalId: c.corGlobalId } }); if (!cor) cor = await tx.produtoCor.create({ data: { produtoId: params.id, corGlobalId: c.corGlobalId, nome: c.cor } }); const variante = await tx.produtoVariante.create({ data: { produtoId: params.id, corId: cor.id, gradeItemId: c.gradeItemId } }); await tx.estoque.create({ data: { varianteId: variante.id, quantidade: 0 } }); } await tx.produto.update({ where: { id: params.id }, data: { gradeId } }); return novas.length; });
  return NextResponse.json({ ok: true, criadas: resultado });
}
export const POST = withApiAccess(handler);
