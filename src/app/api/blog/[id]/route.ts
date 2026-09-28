import { withApiAccess } from "@/lib/api-access";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/blog/[id] — pode ser CUID ou slug
async function GETHandler(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  const post = await prisma.postBlog.findFirst({
    where: {
      OR: [
        { id },
        { slug: id, publicado: true },
      ],
    },
  });

  if (!post) return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });

  return NextResponse.json(post);
}

async function PUTHandler(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = params;

  const body = await req.json();
  const { titulo, slug, resumo, conteudo, imagemCapa, autor, publicado, destaque, palavrasChave } = body;

  const atual = await prisma.postBlog.findUnique({ where: { id } });
  if (!atual) return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });

  const post = await prisma.postBlog.update({
    where: { id },
    data: {
      titulo,
      slug: slug
        ? slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-")
        : undefined,
      resumo: resumo ?? null,
      conteudo,
      imagemCapa: imagemCapa ?? null,
      autor: autor || "Equipe Cavalheiro",
      publicado: publicado ?? false,
      destaque: destaque ?? false,
      palavrasChave: palavrasChave ?? null,
      publicadoEm:
        publicado && !atual.publicadoEm ? new Date() : atual.publicadoEm,
    },
  });

  return NextResponse.json(post);
}

async function DELETEHandler(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = params;

  await prisma.postBlog.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}

export const GET = withApiAccess(GETHandler);
export const PUT = withApiAccess(PUTHandler);
export const DELETE = withApiAccess(DELETEHandler);
