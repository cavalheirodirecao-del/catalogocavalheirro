import { withApiAccess, currentActor } from "@/lib/api-access";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
async function patch(req: NextRequest, { params }: { params: { id: string; videoId: string } }) {
  const actor = await currentActor(req); if (!actor || !["ADMIN", "GERENTE"].includes(actor.perfil)) return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });
  const body = await req.json(); const video = await prisma.videoProduto.updateMany({ where: { id: params.videoId, produtoId: params.id }, data: { ...(body.ativo !== undefined ? { ativo: body.ativo } : {}), ...(body.ordem !== undefined ? { ordem: body.ordem } : {}), ...(body.titulo !== undefined ? { titulo: body.titulo } : {}), ...(body.legenda !== undefined ? { legenda: body.legenda } : {}) } });
  if (!video.count) return NextResponse.json({ erro: "Vídeo não encontrado." }, { status: 404 }); return NextResponse.json({ ok: true });
}
async function remove(req: NextRequest, { params }: { params: { id: string; videoId: string } }) {
  const actor = await currentActor(req); if (!actor || actor.perfil !== "ADMIN") return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });
  await prisma.videoProduto.deleteMany({ where: { id: params.videoId, produtoId: params.id } }); return NextResponse.json({ ok: true });
}
export const PATCH = withApiAccess(patch); export const DELETE = withApiAccess(remove);
