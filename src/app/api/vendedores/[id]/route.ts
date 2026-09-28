import { withApiAccess } from "@/lib/api-access";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function GETHandler(_: Request, { params }: { params: { id: string } }) {
  const vendedor = await prisma.vendedor.findUnique({
    where: { id: params.id },
    include: { usuario: { select: { id: true, nome: true, email: true, ativo: true, perfil: true } }, links: true, loja: true },
  });
  if (!vendedor) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(vendedor);
}

async function PUTHandler(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { nome, email, telefone, slug, lojaId, ativo, catalogos } = body;

    const vendedor = await prisma.vendedor.findUnique({
      where: { id: params.id },
      include: { usuario: { select: { id: true, nome: true, email: true, ativo: true, perfil: true } } },
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

      // Preserve IDs referenced by historical orders.
      await tx.linkVendedor.updateMany({ where: { vendedorId: params.id }, data: { ativo: false } });
      for (const catalogo of catalogos ?? []) {
        await tx.linkVendedor.upsert({
          where: { vendedorId_catalogo: { vendedorId: params.id, catalogo } },
          update: { ativo: true }, create: { vendedorId: params.id, catalogo, ativo: true },
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Email ou slug já cadastrado" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function DELETEHandler(_: Request, { params }: { params: { id: string } }) {
  const vendedor = await prisma.vendedor.findUnique({ where: { id: params.id } });
  if (!vendedor) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  await prisma.$transaction([
    prisma.vendedor.update({ where: { id: params.id }, data: { ativo: false } }),
    prisma.usuario.update({ where: { id: vendedor.usuarioId }, data: { ativo: false } }),
  ]);

  return NextResponse.json({ ok: true });
}

export const GET = withApiAccess(GETHandler);
export const PUT = withApiAccess(PUTHandler);
export const DELETE = withApiAccess(DELETEHandler);
