import { withApiAccess } from "@/lib/api-access";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function GETHandler() {
  const produtos = await prisma.produto.findMany({
    orderBy: { criadoEm: "desc" },
    select: {
      id: true, codigo: true, nome: true, ativo: true, criadoEm: true,
      precoVarejoVista: true, precoAtacadoVista: true, precoFabricaVista: true,
      grupo: { select: { id: true, nome: true } },
      subGrupo: { select: { id: true, nome: true } },
    },
  });
  return NextResponse.json(produtos);
}

async function POSTHandler(request: NextRequest) {
  const body = await request.json();
  const {
    codigo, nome, descricao, descricaoCompleta, videoUrl, imagemPrincipal, tabelaMedidas,
    grupoId, subGrupoId, gradeId,
    precoVarejoVista, precoVarejoPrazo,
    precoAtacadoVista, precoAtacadoPrazo,
    precoFabricaVista, precoFabricaPrazo,
    cores, // [{ nome, hexCor, imagens: [{ url, principal, ordem }] }]
  } = body;

  // Busca os itens da grade para criar variantes automaticamente
  let gradeAtualId = gradeId || null;
  if (!gradeAtualId) {
    const gradeUnica = await prisma.grade.upsert({ where: { nome: "UNICO" }, update: {}, create: { nome: "UNICO", tipo: "LETRA", itens: { create: [{ valor: "UNICO", ordem: 0 }] } }, include: { itens: true } });
    gradeAtualId = gradeUnica.id;
  }
  const gradeItens = gradeAtualId
    ? await prisma.gradeItem.findMany({ where: { gradeId: gradeAtualId } })
    : [];

  const produto = await prisma.produto.create({
    data: {
      codigo, nome, descricao,
      descricaoCompleta: descricaoCompleta || null,
      videoUrl,
      imagemPrincipal: imagemPrincipal || null,
      tabelaMedidas: tabelaMedidas || null,
      grupoId: grupoId || null,
      subGrupoId: subGrupoId || null,
      gradeId: gradeAtualId,
      precoVarejoVista, precoVarejoPrazo,
      precoAtacadoVista, precoAtacadoPrazo,
      precoFabricaVista, precoFabricaPrazo,
      novidade: body.novidade ?? false,
      oferta:   body.oferta   ?? false,
    },
  });

  // Cria cores + imagens + variantes para cada gradeItem
  const coresCadastro = cores?.length ? cores : [{ nome: "VARIADA", hexCor: null, imagens: [] }];
  for (const cor of coresCadastro) {
    const produtoCor = await prisma.produtoCor.create({
      data: {
        produtoId: produto.id,
        nome: cor.nome,
        hexCor: cor.hexCor || null,
        imagens: {
          create: cor.imagens.map((img: any, idx: number) => ({
            url: img.url,
            principal: img.principal ?? idx === 0,
            ordem: idx,
          })),
        },
      },
    });

    // Cria variante + estoque para cada tamanho da grade
    for (const gradeItem of gradeItens) {
      const variante = await prisma.produtoVariante.create({
        data: {
          produtoId: produto.id,
          corId: produtoCor.id,
          gradeItemId: gradeItem.id,
        },
      });
      await prisma.estoque.create({
        data: { varianteId: variante.id, quantidade: 0 },
      });
    }
  }

  return NextResponse.json({ id: produto.id });
}

export const GET = withApiAccess(GETHandler);
export const POST = withApiAccess(POSTHandler);
