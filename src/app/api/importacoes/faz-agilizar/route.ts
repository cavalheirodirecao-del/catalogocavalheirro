import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { withApiAccess } from "@/lib/api-access";
import { prisma } from "@/lib/prisma";
import { lerExportacaoFazAgilizar, ProdutoImportado } from "@/lib/faz-agilizar";

const PERFIS_PERMITIDOS = ["ADMIN", "GERENTE", "ESTOQUISTA"];
type Grade = { id: string; itens: { id: string; valor: string }[] };

function selecionarGrade(produto: ProdutoImportado, grades: Grade[]) {
  const tamanhos = Array.from(new Set(produto.variacoes.map(v => v.tamanho)));
  return grades
    .filter(grade => tamanhos.every(tamanho => grade.itens.some(item => item.valor.toUpperCase() === tamanho)))
    .sort((a, b) => a.itens.length - b.itens.length)[0] ?? null;
}

async function montarPlano(csv: string, grupoId: string, subGrupoId: string) {
  const leitura = lerExportacaoFazAgilizar(csv);
  if (!grupoId) leitura.erros.push("Escolha uma categoria para os produtos novos.");
  if (leitura.erros.length) return { ...leitura, plano: [] as any[] };

  const [grupo, grades, existentes] = await Promise.all([
    prisma.grupo.findUnique({ where: { id: grupoId }, select: { id: true } }),
    prisma.grade.findMany({ include: { itens: true } }),
    prisma.produto.findMany({ where: { codigo: { in: leitura.produtos.map(p => p.codigo) } }, include: { cores: { include: { variantes: { include: { estoque: true, gradeItem: true } } } } } }),
  ]);
  if (!grupo) leitura.erros.push("A categoria selecionada não existe.");
  if (subGrupoId && !(await prisma.subGrupo.findFirst({ where: { id: subGrupoId, grupoId }, select: { id: true } }))) leitura.erros.push("A subcategoria selecionada não pertence à categoria.");
  const porCodigo = new Map(existentes.map((produto: any) => [produto.codigo, produto]));
  const plano = leitura.produtos.map(produto => {
    const grade = selecionarGrade(produto, grades);
    // Grades ausentes serão criadas automaticamente na liberação da importação.
    return { produto, grade, existente: porCodigo.get(produto.codigo) ?? null };
  });
  return { ...leitura, plano };
}

async function POSTHandler(req: NextRequest) {
  const form = await req.formData();
  const arquivo = form.get("arquivo");
  const grupoId = String(form.get("grupoId") ?? "");
  const subGrupoId = String(form.get("subGrupoId") ?? "");
  const acao = String(form.get("acao") ?? "validar");
  if (!(arquivo instanceof File)) return NextResponse.json({ erro: "Selecione um arquivo CSV." }, { status: 400 });
  if (arquivo.size > 8 * 1024 * 1024) return NextResponse.json({ erro: "O arquivo deve ter no máximo 8 MB." }, { status: 400 });

  const plano = await montarPlano(await arquivo.text(), grupoId, subGrupoId);
  const resumo = {
    linhas: plano.itens.length,
    produtos: plano.produtos?.length ?? 0,
    novos: plano.plano.filter(p => !p.existente).length,
    existentes: plano.plano.filter(p => p.existente).length,
    erros: plano.erros,
    amostra: plano.plano.slice(0, 12).map((p: any) => ({ codigo: p.produto.codigo, nome: p.produto.nome, variacoes: p.produto.variacoes.length, situacao: p.existente ? "ATUALIZAR" : "CRIAR" })),
  };
  if (acao === "validar") return NextResponse.json(resumo);
  if (acao !== "liberar") return NextResponse.json({ erro: "Ação inválida." }, { status: 400 });
  if (plano.erros.length) return NextResponse.json({ ...resumo, erro: "Corrija os bloqueios antes de liberar a importação." }, { status: 422 });

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !PERFIS_PERMITIDOS.includes(String((token as any).perfil))) return NextResponse.json({ erro: "Sem permissão para importar estoque." }, { status: 403 });
  const usuarioId = String(token.id ?? token.sub);

  await prisma.$transaction(async tx => {
    for (const item of plano.plano) {
      const { produto: fonte, grade, existente } = item;
      let gradeAtual = grade;
      if (!gradeAtual) {
        const tamanhos = Array.from(new Set(fonte.variacoes.map(v => v.tamanho)));
        const nomeGrade = `Faz Agilizar: ${tamanhos.join("/")}`;
        gradeAtual = await tx.grade.upsert({
          where: { nome: nomeGrade },
          update: {},
          create: { nome: nomeGrade, tipo: tamanhos.every(t => /^\d+$/.test(t)) ? "NUMERO" : "LETRA", itens: { create: tamanhos.map((valor, ordem) => ({ valor, ordem })) } },
          include: { itens: true },
        });
      }
      const produto = existente ?? await tx.produto.create({
        data: {
          codigo: fonte.codigo, nome: fonte.nome, grupoId, subGrupoId: subGrupoId || null, gradeId: gradeAtual.id,
          precoVarejoVista: fonte.origem === "VAREJO" ? fonte.precoAtacado : 0,
          precoVarejoPrazo: fonte.origem === "VAREJO" ? fonte.precoAtacado : 0,
          precoAtacadoVista: fonte.origem === "ATACADO" ? fonte.precoAtacado : 0,
          precoAtacadoPrazo: fonte.origem === "ATACADO" ? fonte.precoAtacado : 0,
          precoFabricaVista: 0, precoFabricaPrazo: 0,
        },
      });
      if (existente) await tx.produto.update({ where: { id: produto.id }, data: fonte.origem === "VAREJO"
        ? { nome: fonte.nome, precoVarejoVista: fonte.precoAtacado, precoVarejoPrazo: fonte.precoAtacado }
        : { nome: fonte.nome, precoAtacadoVista: fonte.precoAtacado, precoAtacadoPrazo: fonte.precoAtacado } });

      for (const variacao of fonte.variacoes) {
        const gradeItem = gradeAtual.itens.find((i: { id: string; valor: string }) => i.valor.toUpperCase() === variacao.tamanho);
        if (!gradeItem) throw new Error(`Tamanho ${variacao.tamanho} não encontrado para ${fonte.codigo}.`);
        let cor = existente?.cores.find((c: any) => c.nome.toUpperCase() === variacao.cor) ?? null;
        if (!cor) cor = await tx.produtoCor.create({ data: { produtoId: produto.id, nome: variacao.cor } });
        let variante = existente?.cores.find((c: any) => c.id === cor!.id)?.variantes.find((v: any) => v.gradeItemId === gradeItem.id) ?? null;
        if (!variante) variante = await tx.produtoVariante.create({ data: { produtoId: produto.id, corId: cor.id, gradeItemId: gradeItem.id } });
        const estoqueAnterior = existente?.cores.find((c: any) => c.id === cor!.id)?.variantes.find((v: any) => v.id === variante!.id)?.estoque?.quantidade ?? 0;
        await tx.estoque.upsert({ where: { varianteId: variante.id }, update: { quantidade: variacao.estoque }, create: { varianteId: variante.id, quantidade: variacao.estoque } });
        if (estoqueAnterior !== variacao.estoque) await tx.movimentacaoEstoque.create({ data: { varianteId: variante.id, tipo: "AJUSTE", quantidade: Math.abs(variacao.estoque - estoqueAnterior), usuarioId, obs: `Importação Faz Agilizar: ${estoqueAnterior} para ${variacao.estoque}` } });
      }
    }
  }, { timeout: 60000 });

  return NextResponse.json({ ...resumo, ok: true });
}

export const POST = withApiAccess(POSTHandler);
