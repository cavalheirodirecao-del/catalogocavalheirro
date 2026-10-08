import { withApiAccess, currentActor } from "@/lib/api-access";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getVideos(_: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json(await prisma.videoProduto.findMany({ where: { produtoId: params.id, ativo: true }, orderBy: { ordem: "asc" } }));
}
async function createVideo(req: NextRequest, { params }: { params: { id: string } }) {
  const actor = await currentActor(req); if (!actor || !["ADMIN", "GERENTE"].includes(actor.perfil)) return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });
  const body = await req.json(); const count = await prisma.videoProduto.count({ where: { produtoId: params.id, ativo: true } });
  if (count >= 3) return NextResponse.json({ erro: "O produto pode ter no máximo 3 vídeos ativos." }, { status: 422 });
  if (!body.cdnUrl) return NextResponse.json({ erro: "Informe a URL do vídeo." }, { status: 400 });
  const video = await prisma.videoProduto.create({ data: { produtoId: params.id, cdnUrl: body.cdnUrl, bunnyVideoId: body.bunnyVideoId ?? null, bunnyLibraryId: body.bunnyLibraryId ?? process.env.BUNNY_LIBRARY_ID ?? null, thumbnailUrl: body.thumbnailUrl ?? null, titulo: body.titulo ?? null, legenda: body.legenda ?? null, ordem: body.ordem ?? count, canais: body.canais ?? ["VAREJO", "ATACADO", "FABRICA"] } });
  return NextResponse.json(video, { status: 201 });
}
async function updateVideo(req: NextRequest, { params }: { params: { id: string } }) {
  const actor = await currentActor(req); if (!actor || !["ADMIN", "GERENTE"].includes(actor.perfil)) return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });
  const body = await req.json(); const video = await prisma.videoProduto.update({ where: { id: params.id }, data: { ...(body.ativo !== undefined ? { ativo: body.ativo } : {}), ...(body.ordem !== undefined ? { ordem: body.ordem } : {}), ...(body.titulo !== undefined ? { titulo: body.titulo } : {}), ...(body.legenda !== undefined ? { legenda: body.legenda } : {}) } });
  return NextResponse.json(video);
}
async function deleteVideo(req: NextRequest, { params }: { params: { id: string } }) {
  const actor = await currentActor(req); if (!actor || actor.perfil !== "ADMIN") return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });
  await prisma.videoProduto.delete({ where: { id: params.id } }); return NextResponse.json({ ok: true });
}
export const GET = withApiAccess(getVideos);
export const POST = withApiAccess(createVideo);
export const PATCH = withApiAccess(updateVideo);
export const DELETE = withApiAccess(deleteVideo);
