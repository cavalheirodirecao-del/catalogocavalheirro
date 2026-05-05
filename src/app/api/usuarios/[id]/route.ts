import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

  const usuario = await prisma.usuario.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      nome: true,
      email: true,
      perfil: true,
      ativo: true,
      vendedor: { select: { id: true } },
    },
  });

  if (!usuario) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 });
  return NextResponse.json(usuario);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).perfil !== "ADMIN") {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const { nome, email, perfil, ativo } = await request.json();

  const usuario = await prisma.usuario.update({
    where: { id: params.id },
    data: { nome, email, perfil, ativo },
  });

  return NextResponse.json({ ok: true, usuario });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).perfil !== "ADMIN") {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  await prisma.usuario.update({
    where: { id: params.id },
    data: { ativo: false },
  });

  return NextResponse.json({ ok: true });
}
