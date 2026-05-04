import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { varianteId, tipo, quantidade, obs, fornecedor, numeroDocumento, dataDocumento } = await req.json();

    if (!varianteId || !tipo || !quantidade) {
      return NextResponse.json({ error: "varianteId, tipo e quantidade são obrigatórios" }, { status: 400 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: (session.user as any).email },
    });
    if (!usuario) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const delta = tipo === "SAIDA" ? -Math.abs(quantidade) : Math.abs(quantidade);

    await prisma.$transaction([
      prisma.movimentacaoEstoque.create({
        data: {
          varianteId, tipo, quantidade: Math.abs(quantidade), usuarioId: usuario.id,
          obs: obs || null,
          fornecedor: fornecedor || null,
          numeroDocumento: numeroDocumento || null,
          dataDocumento: dataDocumento ? new Date(dataDocumento) : null,
        },
      }),
      prisma.estoque.upsert({
        where: { varianteId },
        update: { quantidade: { increment: delta } },
        create: { varianteId, quantidade: delta },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
