import { withApiAccess } from "@/lib/api-access";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function GETHandler(_: NextRequest, { params }: { params: { id: string } }) {
  try {
  const produto = await prisma.produto.findUnique({
    where: { id: params.id },
    include: {
      grupo: true,
      subGrupo: true,
      grade: { include: { itens: { orderBy: { ordem: "asc" } } } },
      cores: {
        include: {
          imagens: { orderBy: { ordem: "asc" } },
          variantes: { include: { estoque: true, gradeItem: true } },
        },
      },
    },
  });
  if (!produto) return NextResponse.json({ erro: "Não encontrado." }, { status: 404 });
  return NextResponse.json(produto);
  } catch (err: any) {
    return NextResponse.json({ erro: err?.message ?? "Erro ao carregar produto." }, { status: 500 });
  }
}

async function PUTHandler(request: NextRequest, { params }: { params: { id: string } }) {
  try {
  const body = await request.json();
  const {
    codigo, nome, descricao, descricaoCompleta, videoUrl, imagemPrincipal, tabelaMedidas,
    grupoId, subGrupoId, gradeId,
    precoVarejoVista, precoVarejoPrazo,
    precoAtacadoVista, precoAtacadoPrazo,
    precoFabricaVista, precoFabricaPrazo,
    ativo, cores, novidade, oferta,
  } = body;

  const produtoAtual = await prisma.produto.findUnique({
    where: { id: params.id },
    select: { gradeId: true, variantes: { select: { id: true } } },
  });
  if (!produtoAtual) return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
  if (gradeId && produtoAtual.gradeId && gradeId !== produtoAtual.gradeId && produtoAtual.variantes.length) {
    return NextResponse.json({ error: "A grade não pode ser trocada enquanto o produto possui variantes. Crie outro produto para outra grade." }, { status: 409 });
  }

  // Atualiza dados base do produto
  await prisma.produto.update({
    where: { id: params.id },
    data: {
      codigo, nome, descricao,
      descricaoCompleta: descricaoCompleta || null,
      videoUrl,
      imagemPrincipal: imagemPrincipal || null,
      tabelaMedidas: tabelaMedidas || null,
      grupoId: grupoId || null,
      subGrupoId: subGrupoId || null,
      gradeId: gradeId || null,
      precoVarejoVista, precoVarejoPrazo,
      precoAtacadoVista, precoAtacadoPrazo,
      precoFabricaVista, precoFabricaPrazo,
      ativo,
      ...(novidade !== undefined ? { novidade } : {}),
      ...(oferta   !== undefined ? { oferta   } : {}),
    },
  });

  const gradeAtualId = gradeId || (await prisma.grade.upsert({ where: { nome: "UNICO" }, update: {}, create: { nome: "UNICO", tipo: "LETRA", itens: { create: [{ valor: "UNICO", ordem: 0 }] } } })).id;
  if (!gradeId) await prisma.produto.update({ where: { id: params.id }, data: { gradeId: gradeAtualId } });
  // Busca itens da grade para novas cores
  const gradeItens = await prisma.gradeItem.findMany({ where: { gradeId: gradeAtualId } });

  // IDs de cores existentes que ainda estão no form
  const coresExistentesIds = cores.filter((c: any) => c.id).map((c: any) => c.id);

  // Remove cores que foram deletadas
  const coresAnteriores = await prisma.produtoCor.findMany({ where: { produtoId: params.id }, select: { id: true } });
  for (const corAntiga of coresAnteriores) {
    if (!coresExistentesIds.includes(corAntiga.id)) {
      const uso = await prisma.movimentacaoEstoque.count({ where: { variante: { corId: corAntiga.id } } });
      const pedidos = await prisma.itemPedido.count({ where: { variante: { corId: corAntiga.id } } });
      if (uso || pedidos) return NextResponse.json({ error: "Não é possível excluir uma cor com histórico. Desative-a mantendo o histórico." }, { status: 409 });
      await prisma.imagemProduto.deleteMany({ where: { corId: corAntiga.id } });
      await prisma.estoque.deleteMany({ where: { variante: { corId: corAntiga.id } } });
      await prisma.produtoVariante.deleteMany({ where: { corId: corAntiga.id } });
      await prisma.produtoCor.delete({ where: { id: corAntiga.id } });
    }
  }

  // Atualiza ou cria cada cor
  for (const cor of (cores?.length ? cores : [{ nome: "VARIADA", hexCor: null, imagens: [] }])) {
    if (cor.id) {
      // Atualiza cor existente
      await prisma.produtoCor.update({
        where: { id: cor.id },
        data: { nome: cor.nome, hexCor: cor.hexCor || null, corGlobalId: cor.corGlobalId || null, ativo: cor.ativo ?? true },
      });
      // Atualiza imagens
      await prisma.imagemProduto.deleteMany({ where: { corId: cor.id } });
      await prisma.imagemProduto.createMany({
        data: cor.imagens.map((img: any, idx: number) => ({
          corId: cor.id,
          url: img.url,
          principal: img.principal ?? idx === 0,
          ordem: idx,
        })),
      });
    } else {
      // Nova cor
      const novaCor = await prisma.produtoCor.create({
        data: {
          produtoId: params.id,
          nome: cor.nome,
          hexCor: cor.hexCor || null,
          corGlobalId: cor.corGlobalId || null,
          imagens: {
            create: cor.imagens.map((img: any, idx: number) => ({
              url: img.url,
              principal: img.principal ?? idx === 0,
              ordem: idx,
            })),
          },
        },
      });
      // Cria variantes para grade atual
      for (const gradeItem of gradeItens) {
        const variante = await prisma.produtoVariante.create({
          data: { produtoId: params.id, corId: novaCor.id, gradeItemId: gradeItem.id },
        });
        await prisma.estoque.create({ data: { varianteId: variante.id, quantidade: 0 } });
      }
    }
  }

  return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function PATCHHandler(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { ativo } = await req.json();
    const produto = await prisma.produto.update({
      where: { id: params.id },
      data: { ativo },
      select: { id: true, ativo: true },
    });
    return NextResponse.json(produto);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function DELETEHandler(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.produto.update({
    where: { id: params.id },
    data: { ativo: false },
  });
  return NextResponse.json({ ok: true });
}

export const GET = withApiAccess(GETHandler);
export const PUT = withApiAccess(PUTHandler);
export const PATCH = withApiAccess(PATCHHandler);
export const DELETE = withApiAccess(DELETEHandler);
