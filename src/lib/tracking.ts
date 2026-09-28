import { createHash } from "node:crypto";
import { decode, encode } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { TipoCatalogo } from "@prisma/client";
import { prisma } from "./prisma";

export const TRACKING_COOKIE = "cavalheiro_ref";
export const VISITOR_COOKIE = "cavalheiro_visitante";
export const SESSION_COOKIE = "cavalheiro_visita";
export const TRACKING_TTL = 7 * 24 * 60 * 60;
export const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
export type Referral = { tipo: "VENDEDOR" | "AFILIADO"; slug: string };

export function referralFromParams(vendedor: unknown, ref: unknown): Referral | null {
  const valid = (value: unknown): value is string => typeof value === "string" && /^[a-z0-9][a-z0-9_-]{0,99}$/i.test(value);
  if (valid(vendedor)) return { tipo: "VENDEDOR", slug: vendedor };
  if (valid(ref)) return { tipo: "AFILIADO", slug: ref };
  return null;
}

export async function readReferral(req: NextRequest): Promise<Referral | null> {
  const raw = req.cookies.get(TRACKING_COOKIE)?.value;
  if (!raw || !process.env.NEXTAUTH_SECRET) return null;
  try {
    const data = await decode({ token: raw, secret: process.env.NEXTAUTH_SECRET });
    if (data?.tipo === "VENDEDOR") return referralFromParams(data.slug, null);
    if (data?.tipo === "AFILIADO") return referralFromParams(null, data.slug);
  } catch { /* Expired or modified cookie: no attribution. */ }
  return null;
}

export async function signReferral(ref: Referral) {
  if (!process.env.NEXTAUTH_SECRET) throw new Error("NEXTAUTH_SECRET não configurado");
  return encode({ token: ref, secret: process.env.NEXTAUTH_SECRET, maxAge: TRACKING_TTL });
}

export async function resolveReferral(ref: Referral | null, catalogo: TipoCatalogo) {
  if (!ref) return null;
  if (ref.tipo === "VENDEDOR") {
    const vendedor = await prisma.vendedor.findFirst({
      where: { slug: ref.slug, ativo: true, usuario: { ativo: true, perfil: { not: "AFILIADO" } }, links: { some: { catalogo, ativo: true } } },
      select: { id: true, slug: true, telefone: true, usuario: { select: { nome: true } }, links: { where: { catalogo, ativo: true }, select: { id: true } } },
    });
    return vendedor ? { ref, vendedor, afiliadoId: null } : null;
  }
  const afiliado = await prisma.afiliado.findFirst({ where: { slug: ref.slug, ativo: true, status: "APROVADO", usuario: { ativo: true }, tipo: catalogo === "VAREJO" ? "VAREJO" : "ATACADO" }, select: { id: true } });
  return afiliado ? { ref, vendedor: null, afiliadoId: afiliado.id } : null;
}

export function visitId(session: string, catalogo: string, source: string) {
  return createHash("sha256").update(JSON.stringify([session, catalogo, source])).digest("hex");
}
export function validTrackingId(value?: string) { return value && /^[0-9a-f-]{36}$/i.test(value) ? value : null; }
