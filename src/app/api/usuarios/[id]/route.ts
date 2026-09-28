import { withApiAccess } from "@/lib/api-access";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

async function GETHandler(request: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

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

async function PUTHandler(request: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || (token as any).perfil !== "ADMIN") {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const { nome, email, perfil, ativo } = await request.json();

  const usuario = await prisma.usuario.update({
    where: { id: params.id },
    data: { nome, email, perfil, ativo },
  });

  return NextResponse.json({ ok: true, usuario });
}

async function DELETEHandler(request: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || (token as any).perfil !== "ADMIN") {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  await prisma.usuario.update({
    where: { id: params.id },
    data: { ativo: false },
  });

  return NextResponse.json({ ok: true });
}

export const GET = withApiAccess(GETHandler);
export const PUT = withApiAccess(PUTHandler);
export const DELETE = withApiAccess(DELETEHandler);
