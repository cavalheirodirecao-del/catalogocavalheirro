import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "./prisma";
import { exclusiveAccess } from "./exclusive-access";
import { canAccessApi, isPublicApi } from "./access-policy";

export async function currentActor(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const id = token?.id ?? token?.sub;
  if (typeof id !== "string") return null;
  return prisma.usuario.findFirst({ where: { id, ativo: true }, select: { id: true, perfil: true, vendedor: { select: { id: true, ativo: true } } } });
}

// Handler-level authorization still applies if middleware is bypassed.
export function withApiAccess(handler: (...args: any[]) => Promise<Response>) {
  return async (req: NextRequest, context: any) => {
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/$/, "");
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      const origin = req.headers.get("origin");
      if (origin && origin !== url.origin) return NextResponse.json({ erro: "Origem não permitida." }, { status: 403 });
    }
    if (!isPublicApi(path, req.method, url.searchParams)) {
      const actor = await currentActor(req);
      if (!actor) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
      if (!canAccessApi(actor.perfil, path, req.method) || (actor.perfil === "VENDEDOR" && !actor.vendedor?.ativo)) return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });
    }
    if (path !== "/api/visitas" && (isPublicApi(path, req.method, url.searchParams) || path === "/api/leads")) {
      const body = req.method === "POST" ? await req.clone().json().catch(() => null) : null;
      const catalogo = body?.catalogo ?? url.searchParams.get("catalogo");
    }
    const response = await handler(req, context);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  };
}
