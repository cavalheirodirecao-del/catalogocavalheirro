import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const admin = searchParams.get("admin") === "1";

  const posts = await prisma.postBlog.findMany({
    where: admin ? {} : { publicado: true },
    orderBy: [{ destaque: "desc" }, { publicadoEm: "desc" }, { criadoEm: "desc" }],
    select: {
      id: true,
      titulo: true,
      slug: true,
      resumo: true,
      imagemCapa: true,
      autor: true,
      publicado: true,
      destaque: true,
      palavrasChave: true,
      publicadoEm: true,
      criadoEm: true,
    },
  });

  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const { titulo, slug, resumo, conteudo, imagemCapa, autor, publicado, destaque, palavrasChave } = body;

  if (!titulo || !slug || !conteudo) {
    return NextResponse.json({ error: "titulo, slug e conteudo são obrigatórios" }, { status: 400 });
  }

  const post = await prisma.postBlog.create({
    data: {
      titulo,
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-"),
      resumo: resumo || null,
      conteudo,
      imagemCapa: imagemCapa || null,
      autor: autor || "Equipe Cavalheiro",
      publicado: publicado ?? false,
      destaque: destaque ?? false,
      palavrasChave: palavrasChave || null,
      publicadoEm: publicado ? new Date() : null,
    },
  });

  return NextResponse.json(post);
}
