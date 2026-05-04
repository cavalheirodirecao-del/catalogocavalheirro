import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const banner = await prisma.banner.findUnique({ where: { id: params.id } });
  if (!banner) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  return NextResponse.json(banner);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { catalogo, titulo, subtitulo, imagemDesktop, imagemTablet, imagemMobile, videoUrl, linkUrl, ordem, ativo } = body;

    const banner = await prisma.banner.update({
      where: { id: params.id },
      data: {
        catalogo,
        titulo: titulo || null,
        subtitulo: subtitulo || null,
        imagemDesktop: imagemDesktop || null,
        imagemTablet: imagemTablet || null,
        imagemMobile: imagemMobile || null,
        videoUrl: videoUrl || null,
        linkUrl: linkUrl || null,
        ordem: ordem ?? 0,
        ativo,
      },
    });

    return NextResponse.json(banner);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.banner.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
