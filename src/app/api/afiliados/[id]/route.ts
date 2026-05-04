import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET /api/afiliados/[id] — detalhe admin
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const afiliado = await prisma.afiliado.findUnique({
    where: { id: params.id },
    include: {
      usuario: { select: { nome: true, email: true, ativo: true } },
      pagamentos: { orderBy: { periodo: "desc" } },
      pedidos: {
        where: { status: { in: ["CONFIRMADO", "ENVIADO", "CONCLUIDO"] } },
        select: {
          numero: true, total: true, status: true, criadoEm: true, catalogo: true,
          nomeClienteAvulso: true, telefoneClienteAvulso: true,
          cliente: { select: { nome: true } },
        },
        orderBy: { criadoEm: "desc" },
        take: 50,
      },
    },
  });

  if (!afiliado) return NextResponse.json({ erro: "Afiliado não encontrado." }, { status: 404 });
  return NextResponse.json(afiliado);
}

// PATCH /api/afiliados/[id] — gestão admin (status, dados, senha)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const {
    status,
    slug, telefone, instagram, cidade, estado, comoPromover,
    nicho, seguidores, tipo,
    // edição do Usuario
    nome, email,
    // reset de senha
    novaSenha,
  } = body;

  const afiliadoData: any = {};
  if (slug !== undefined) afiliadoData.slug = slug.trim();
  if (telefone !== undefined) afiliadoData.telefone = telefone || null;
  if (instagram !== undefined) afiliadoData.instagram = instagram || null;
  if (cidade !== undefined) afiliadoData.cidade = cidade || null;
  if (estado !== undefined) afiliadoData.estado = estado || null;
  if (comoPromover !== undefined) afiliadoData.comoPromover = comoPromover || null;
  if (nicho !== undefined) afiliadoData.nicho = nicho || null;
  if (seguidores !== undefined) afiliadoData.seguidores = seguidores || null;
  if (tipo !== undefined) afiliadoData.tipo = tipo;
  if (status !== undefined) afiliadoData.status = status;

  const afiliado = await prisma.$transaction(async (tx) => {
    const a = await tx.afiliado.update({
      where: { id: params.id },
      data: afiliadoData,
      include: { usuario: true },
    });

    // Dados do Usuario (nome, email, senha, ativo)
    const usuarioData: any = {};
    if (nome !== undefined) usuarioData.nome = nome.trim();
    if (email !== undefined) usuarioData.email = email.trim().toLowerCase();
    if (novaSenha) usuarioData.senha = await bcrypt.hash(novaSenha, 10);

    // Sincroniza ativo com status
    if (status !== undefined) {
      usuarioData.ativo = status === "APROVADO";
    }

    if (Object.keys(usuarioData).length > 0) {
      await tx.usuario.update({
        where: { id: a.usuarioId },
        data: usuarioData,
      });
    }

    return a;
  });

  return NextResponse.json(afiliado);
}
