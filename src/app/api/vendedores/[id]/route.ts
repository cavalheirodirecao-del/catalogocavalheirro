import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const vendedor = await prisma.vendedor.findUnique({
    where: { id: params.id },
    include: { usuario: true, links: true, loja: true },
  });
  if (!vendedor) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(vendedor);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { nome, email, telefone, slug, lojaId, ativo, catalogos } = body;

    const vendedor = await prisma.vendedor.findUnique({
      where: { id: params.id },
      include: { usuario: true },
    });
    if (!vendedor) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      await tx.usuario.update({
        where: { id: vendedor.usuarioId },
        data: { nome, email },
      });

      await tx.vendedor.update({
        where: { id: params.id },
        data: { slug, telefone: telefone || null, lojaId: lojaId || null, ativo },
      });

      // Recria links de catálogo
      await tx.linkVendedor.deleteMany({ where: { vendedorId: params.id } });
      if (catalogos?.length) {
        await tx.linkVendedor.createMany({
          data: catalogos.map((c: string) => ({
            vendedorId: params.id,
            catalogo: c,
            ativo: true,
          })),
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Email ou slug já cadastrado" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const vendedor = await prisma.vendedor.findUnique({ where: { id: params.id } });
  if (!vendedor) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  await prisma.$transaction([
    prisma.vendedor.update({ where: { id: params.id }, data: { ativo: false } }),
    prisma.usuario.update({ where: { id: vendedor.usuarioId }, data: { ativo: false } }),
  ]);

  return NextResponse.json({ ok: true });
}
