import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { gerarSlugAfiliado } from "@/lib/afiliados";
import bcrypt from "bcryptjs";

// GET /api/afiliados — listagem admin
export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const afiliados = await prisma.afiliado.findMany({
    where: status ? { status: status as any } : undefined,
    include: {
      usuario: { select: { nome: true, email: true, ativo: true } },
      _count: { select: { pedidos: true } },
    },
    orderBy: { criadoEm: "desc" },
  });

  return NextResponse.json(afiliados);
}

// POST /api/afiliados — inscrição pública
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { nome, email, senha, telefone, instagram, cidade, estado, comoPromover, tipo, nicho, seguidores } = body;

  if (!nome || !email || !senha) {
    return NextResponse.json({ erro: "Nome, e-mail e senha são obrigatórios." }, { status: 400 });
  }

  // Verifica e-mail duplicado
  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    return NextResponse.json({ erro: "E-mail já cadastrado." }, { status: 400 });
  }

  // Gera slug único
  let slug = gerarSlugAfiliado(nome);
  const slugBase = slug;
  let contador = 1;
  while (await prisma.afiliado.findUnique({ where: { slug } })) {
    slug = `${slugBase}-${contador++}`;
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  // adminCreate=true: cadastro direto pelo admin, já aprovado — exige token ADMIN
  const adminCreate = body.adminCreate === true;
  if (adminCreate) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || (token as any).perfil !== "ADMIN") {
      return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
    }
  }

  const afiliado = await prisma.$transaction(async (tx) => {
    const usuario = await tx.usuario.create({
      data: {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senha: senhaHash,
        perfil: "AFILIADO",
        ativo: adminCreate, // admin cria já ativo; público aguarda aprovação
      },
    });

    return tx.afiliado.create({
      data: {
        usuarioId: usuario.id,
        slug,
        telefone: telefone?.trim() || null,
        instagram: instagram?.trim() || null,
        cidade: cidade?.trim() || null,
        estado: estado?.trim() || null,
        comoPromover: comoPromover?.trim() || null,
        tipo: tipo === "ATACADO" ? "ATACADO" : "VAREJO",
        nicho: nicho?.trim() || null,
        seguidores: seguidores?.trim() || null,
        status: adminCreate ? "APROVADO" : "PENDENTE",
      },
    });
  });

  return NextResponse.json({ ok: true, slug: afiliado.slug }, { status: 201 });
}
