import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const produtos = await prisma.produto.findMany({
    orderBy: { criadoEm: "desc" },
    include: {
      grupo: true,
      subGrupo: true,
      grade: true,
      cores: {
        include: {
          imagens: { orderBy: { ordem: "asc" } },
          variantes: { include: { estoque: true, gradeItem: true } },
        },
      },
    },
  });
  return NextResponse.json(produtos);
}

export async function POST(request: NextRequest) {
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
  const gradeItens = gradeId
    ? await prisma.gradeItem.findMany({ where: { gradeId } })
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
      gradeId: gradeId || null,
      precoVarejoVista, precoVarejoPrazo,
      precoAtacadoVista, precoAtacadoPrazo,
      precoFabricaVista, precoFabricaPrazo,
      novidade: body.novidade ?? false,
      oferta:   body.oferta   ?? false,
    },
  });

  // Cria cores + imagens + variantes para cada gradeItem
  for (const cor of cores) {
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
