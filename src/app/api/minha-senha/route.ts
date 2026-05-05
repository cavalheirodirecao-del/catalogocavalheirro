import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

  const { senhaAtual, novaSenha } = await request.json();

  if (!senhaAtual || !novaSenha || novaSenha.length < 6) {
    return NextResponse.json(
      { erro: "Preencha todos os campos. Nova senha mínimo 6 caracteres." },
      { status: 400 }
    );
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: (session.user as any).id },
  });
  if (!usuario) return NextResponse.json({ erro: "Usuário não encontrado." }, { status: 404 });

  const senhaOk = await bcrypt.compare(senhaAtual, usuario.senha);
  if (!senhaOk) return NextResponse.json({ erro: "Senha atual incorreta." }, { status: 400 });

  const novaHash = await bcrypt.hash(novaSenha, 10);
  await prisma.usuario.update({
    where: { id: (session.user as any).id },
    data: { senha: novaHash },
  });

  return NextResponse.json({ ok: true });
}
