// Recebe os parâmetros, salva um CatalogoJob no banco e retorna o ID.
// A geração real acontece em /api/catalogo/processar/[id] (disparada pelo frontend).

export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { grupoId, subGrupoId, capaUrl, tabelaPreco, layout } = await req.json();

    if (!tabelaPreco || !layout) {
      return NextResponse.json({ erro: "Tabela de preço e layout são obrigatórios." }, { status: 400 });
    }

    const job = await prisma.catalogoJob.create({
      data: {
        grupoId: grupoId || null,
        subGrupoId: subGrupoId || null,
        capaUrl: capaUrl || null,
        tabelaPreco,
        layout,
      },
    });

    return NextResponse.json({ id: job.id });
  } catch (err) {
    console.error("[catalogo/gerar]", err);
    return NextResponse.json({ erro: "Falha ao criar o job." }, { status: 500 });
  }
}
