import { withApiAccess, currentActor } from "@/lib/api-access";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
async function getCores() { return NextResponse.json(await prisma.corGlobal.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } })); }
async function createCor(req: NextRequest) { const a = await currentActor(req); if (!a || !["ADMIN", "GERENTE"].includes(a.perfil)) return NextResponse.json({ erro: "Sem permissão." }, { status: 403 }); const b = await req.json(); if (!b.nome?.trim()) return NextResponse.json({ erro: "Nome obrigatório." }, { status: 400 }); return NextResponse.json(await prisma.corGlobal.upsert({ where: { nome: b.nome.trim() }, update: { hexCor: b.hexCor || null, ativo: true }, create: { nome: b.nome.trim(), hexCor: b.hexCor || null } })); }
export const GET = withApiAccess(getCores); export const POST = withApiAccess(createCor);
