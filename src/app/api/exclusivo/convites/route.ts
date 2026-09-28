import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentActor, withApiAccess } from "@/lib/api-access";
const fields = { id: true, nome: true, telefone: true, ativo: true, criadoEm: true, expiraEm: true, usadoEm: true } as const;
export const GET = withApiAccess(async () => NextResponse.json(await prisma.acessoExclusivo.findMany({ select: fields, orderBy: { criadoEm: "desc" } })));
const input = z.object({ acao: z.enum(["emitir", "revogar"]), id: z.string().max(100).optional(), nome: z.string().trim().min(2).max(160).optional(), telefone: z.string().transform(v => v.replace(/\D/g, "")).pipe(z.string().min(10).max(15)).optional() });
export const POST = withApiAccess(async (req: NextRequest) => {
  const actor = await currentActor(req);
  if (!actor || !["ADMIN", "GERENTE"].includes(actor.perfil)) return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });
  const parsed = input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ erro: "Confira nome, telefone e ação." }, { status: 400 });
  const b = parsed.data;
  if (b.id && !await prisma.acessoExclusivo.findUnique({ where: { id: b.id }, select: { id: true } })) return NextResponse.json({ erro: "Cliente não encontrado." }, { status: 404 });
  if (b.acao === "revogar") {
    if (!b.id) return NextResponse.json({ erro: "Informe o cliente." }, { status: 400 });
    await prisma.acessoExclusivo.update({ where: { id: b.id }, data: { ativo: false, tokenHash: null, versao: { increment: 1 }, atualizadoPor: actor.id } });
    return NextResponse.json({ ok: true });
  }
  if (!b.id && (!b.nome || !b.telefone)) return NextResponse.json({ erro: "Informe nome e telefone do cliente aprovado." }, { status: 400 });
  const token = randomBytes(32).toString("hex");
  const data = { ativo: true, tokenHash: createHash("sha256").update(token).digest("hex"), expiraEm: new Date(Date.now() + 72 * 3600000), usadoEm: null, atualizadoPor: actor.id };
  const acesso = b.id ? await prisma.acessoExclusivo.update({ where: { id: b.id }, data: { ...data, versao: { increment: 1 } }, select: fields }) : await prisma.acessoExclusivo.create({ data: { ...data, nome: b.nome!, telefone: b.telefone!, criadoPor: actor.id }, select: fields });
  return NextResponse.json({ ...acesso, convite: "/acesso-exclusivo#" + token });
});
