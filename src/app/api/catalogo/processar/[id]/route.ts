export const runtime = "nodejs";
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import React from "react";
import { prisma } from "@/lib/prisma";
import { CatalogoPDF } from "@/components/pdf/CatalogoPDF";
import type { TabelaPreco, LayoutPDF, ProdutoPDF } from "@/components/pdf/types";

function toAbsolute(url: string | null, baseUrl: string): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${baseUrl}${url}`;
}

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const baseUrl = `${_req.nextUrl.protocol}//${_req.nextUrl.host}`;
  const job = await prisma.catalogoJob.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ erro: "Job não encontrado." }, { status: 404 });
  if (job.status === "PROCESSANDO" || job.status === "CONCLUIDO") {
    return NextResponse.json({ status: job.status });
  }

  // Marca como processando
  await prisma.catalogoJob.update({
    where: { id: job.id },
    data: { status: "PROCESSANDO" },
  });

  try {
    const produtosRaw = await prisma.produto.findMany({
      where: {
        ativo: true,
        ...(job.grupoId ? { grupoId: job.grupoId } : {}),
        ...(job.subGrupoId ? { subGrupoId: job.subGrupoId } : {}),
      },
      include: {
        grupo: true,
        subGrupo: true,
        cores: {
          where: { ativo: true },
          include: {
            imagens: { orderBy: { ordem: "asc" } },
            variantes: {
              where: { ativo: true },
              include: { gradeItem: true, estoque: true },
              orderBy: { gradeItem: { ordem: "asc" } },
            },
          },
        },
      },
      orderBy: { codigo: "asc" },
    });

    if (produtosRaw.length === 0) {
      await prisma.catalogoJob.update({
        where: { id: job.id },
        data: { status: "ERRO", erro: "Nenhum produto encontrado com os filtros selecionados." },
      });
      return NextResponse.json({ erro: "Nenhum produto encontrado." }, { status: 404 });
    }

    const produtos: ProdutoPDF[] = produtosRaw.map(p => ({
      id: p.id,
      codigo: p.codigo,
      nome: p.nome,
      imagemPrincipal: toAbsolute(p.imagemPrincipal ?? null, baseUrl),
      precoVarejoVista: Number(p.precoVarejoVista),
      precoVarejoPrazo: Number(p.precoVarejoPrazo),
      precoAtacadoVista: Number(p.precoAtacadoVista),
      precoAtacadoPrazo: Number(p.precoAtacadoPrazo),
      precoFabricaVista: Number(p.precoFabricaVista),
      precoFabricaPrazo: Number(p.precoFabricaPrazo),
      cores: p.cores.map(cor => ({
        id: cor.id,
        nome: cor.nome,
        hexCor: cor.hexCor ?? null,
        imagens: cor.imagens.map(img => ({ url: toAbsolute(img.url, baseUrl) ?? img.url, principal: img.principal, ordem: img.ordem })),
        variantes: cor.variantes.map(v => ({
          id: v.id,
          gradeItem: { id: v.gradeItem.id, valor: v.gradeItem.valor, ordem: v.gradeItem.ordem },
          estoque: v.estoque ? { quantidade: v.estoque.quantidade } : null,
        })),
      })),
    }));

    const grupoNome = produtosRaw[0]?.grupo?.nome;
    const subGrupoNome = produtosRaw[0]?.subGrupo?.nome;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfBuffer = await renderToBuffer(
      React.createElement(CatalogoPDF, {
        produtos,
        capaUrl: toAbsolute(job.capaUrl ?? null, baseUrl),
        tabelaPreco: job.tabelaPreco as TabelaPreco,
        layout: job.layout as LayoutPDF,
        grupoNome,
        subGrupoNome,
      }) as any
    );

    // Salva o PDF em /public/uploads/catalogos/
    const dir = path.join(process.cwd(), "public", "uploads", "catalogos");
    await mkdir(dir, { recursive: true });
    const filename = `${job.id}.pdf`;
    await writeFile(path.join(dir, filename), pdfBuffer);

    const pdfUrl = `/uploads/catalogos/${filename}`;
    await prisma.catalogoJob.update({
      where: { id: job.id },
      data: { status: "CONCLUIDO", pdfUrl, concluidoEm: new Date() },
    });

    return NextResponse.json({ status: "CONCLUIDO", pdfUrl });
  } catch (err) {
    console.error("[catalogo/processar]", err);
    const msg = err instanceof Error ? err.message : "Erro desconhecido.";
    await prisma.catalogoJob.update({
      where: { id: job.id },
      data: { status: "ERRO", erro: msg },
    });
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
