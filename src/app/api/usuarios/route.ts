import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

  const usuarios = await prisma.usuario.findMany({
    where: { perfil: { not: "AFILIADO" } },
    select: {
      id: true,
      nome: true,
      email: true,
      perfil: true,
      ativo: true,
      criadoEm: true,
      vendedor: { select: { id: true } },
    },
    orderBy: { nome: "asc" },
  });

  return NextResponse.json(usuarios);
}

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || (token as any).perfil !== "ADMIN") {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const { nome, email, senha, perfil } = await request.json();

  if (!nome || !email || !senha || !perfil) {
    return NextResponse.json({ erro: "Campos obrigatórios ausentes." }, { status: 400 });
  }

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) return NextResponse.json({ erro: "E-mail já cadastrado." }, { status: 409 });

  const senhaHash = await bcrypt.hash(senha, 10);

  const usuario = await prisma.usuario.create({
    data: { nome, email, senha: senhaHash, perfil },
  });

  return NextResponse.json(usuario, { status: 201 });
}
