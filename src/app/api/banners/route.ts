import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const banners = await prisma.banner.findMany({
    orderBy: [{ catalogo: "asc" }, { ordem: "asc" }],
  });
  return NextResponse.json(banners);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { catalogo, titulo, subtitulo, imagemDesktop, imagemTablet, imagemMobile, videoUrl, linkUrl, ordem } = body;

    if (!catalogo) {
      return NextResponse.json({ error: "Campo obrigatório: catalogo" }, { status: 400 });
    }

    const banner = await prisma.banner.create({
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
        ativo: true,
      },
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
