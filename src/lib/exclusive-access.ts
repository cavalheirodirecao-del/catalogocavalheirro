import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const EXCLUSIVE_COOKIE = "cavalheiro_exclusivo";
export const EXCLUSIVE_TTL = 7 * 24 * 60 * 60;
export async function exclusiveAccess(req?: NextRequest) {
  const raw = req ? req.cookies.get(EXCLUSIVE_COOKIE)?.value : cookies().get(EXCLUSIVE_COOKIE)?.value;
  if (!raw || !process.env.NEXTAUTH_SECRET) return null;
  try {
    const token = await decode({ token: raw, secret: process.env.NEXTAUTH_SECRET });
    if (token?.tipo !== "EXCLUSIVO" || typeof token.acessoId !== "string" || typeof token.versao !== "number") return null;
    return await prisma.acessoExclusivo.findFirst({
      where: { id: token.acessoId, ativo: true, versao: token.versao },
      select: { id: true, nome: true, telefone: true, versao: true },
    });
  } catch { return null; }
}
