import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { encode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { withApiAccess } from "@/lib/api-access";
import { EXCLUSIVE_COOKIE, EXCLUSIVE_TTL } from "@/lib/exclusive-access";

export const POST = withApiAccess(async (req: NextRequest) => {
  const body = await req.json().catch(() => null);
  if (typeof body?.token !== "string" || !/^[a-f0-9]{64}$/.test(body.token)) return NextResponse.json({ erro: "Convite inválido." }, { status: 400 });
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return NextResponse.json({ erro: "Acesso temporariamente indisponível." }, { status: 503 });
  const tokenHash = createHash("sha256").update(body.token).digest("hex");
  const convite = await prisma.acessoExclusivo.findFirst({ where: { tokenHash, ativo: true, usadoEm: null, expiraEm: { gt: new Date() } } });
  if (!convite) return NextResponse.json({ erro: "Este convite expirou, já foi utilizado ou foi revogado. Solicite um novo link ao seu atendimento." }, { status: 403 });
  const signed = await encode({ secret, maxAge: EXCLUSIVE_TTL, token: { tipo: "EXCLUSIVO", acessoId: convite.id, versao: convite.versao } });
  const consumed = await prisma.acessoExclusivo.updateMany({ where: { id: convite.id, versao: convite.versao, tokenHash, ativo: true, usadoEm: null, expiraEm: { gt: new Date() } }, data: { usadoEm: new Date(), tokenHash: null } });
  if (consumed.count !== 1) return NextResponse.json({ erro: "Convite já utilizado. Solicite um novo link." }, { status: 403 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(EXCLUSIVE_COOKIE, signed, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: EXCLUSIVE_TTL });
  return res;
});
