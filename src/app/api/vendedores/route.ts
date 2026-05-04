import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const vendedores = await prisma.vendedor.findMany({
    include: { usuario: true, links: true },
    orderBy: { usuario: { nome: "asc" } },
  });
  return NextResponse.json(vendedores);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, email, senha, telefone, slug, lojaId, catalogos } = body;

    if (!nome || !email || !senha || !slug) {
      return NextResponse.json({ error: "Campos obrigatórios: nome, email, senha, slug" }, { status: 400 });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const vendedor = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          nome,
          email,
          senha: senhaHash,
          perfil: "VENDEDOR",
          ativo: true,
        },
      });

      const v = await tx.vendedor.create({
        data: {
          usuarioId: usuario.id,
          slug,
          telefone: telefone || null,
          lojaId: lojaId || null,
          ativo: true,
        },
      });

      if (catalogos?.length) {
        await tx.linkVendedor.createMany({
          data: catalogos.map((c: string) => ({
            vendedorId: v.id,
            catalogo: c,
            ativo: true,
          })),
        });
      }

      return v;
    });

    return NextResponse.json(vendedor, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Email ou slug já cadastrado" }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
