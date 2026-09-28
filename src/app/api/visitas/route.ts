import { withApiAccess } from "@/lib/api-access";
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookieOptions, readReferral, referralFromParams, resolveReferral, SESSION_COOKIE, signReferral, TRACKING_COOKIE, TRACKING_TTL, validTrackingId, VISITOR_COOKIE, visitId } from "@/lib/tracking";

async function POSTHandler(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !["VAREJO", "ATACADO", "FABRICA"].includes(body.catalogo)) return NextResponse.json({ erro: "Catálogo inválido." }, { status: 400 });
  const explicit = referralFromParams(body.vendedorSlug, body.afiliadoSlug);
  const resolvedExplicit = await resolveReferral(explicit, body.catalogo);
  const attribution = resolvedExplicit ?? await resolveReferral(await readReferral(req), body.catalogo);
  const visitanteId = validTrackingId(req.cookies.get(VISITOR_COOKIE)?.value) ?? randomUUID();
  const session = validTrackingId(req.cookies.get(SESSION_COOKIE)?.value) ?? randomUUID();
  const source = attribution ? `${attribution.ref.tipo}:${attribution.ref.slug}` : "DIRETO";
  const id = visitId(session, body.catalogo, source);
  await prisma.visita.upsert({ where: { id }, update: {}, create: {
    id, catalogo: body.catalogo, visitanteId,
    vendedorId: attribution?.vendedor?.id ?? null, afiliadoId: attribution?.afiliadoId ?? null,
    pais: req.headers.get("x-vercel-ip-country"), estado: req.headers.get("x-vercel-ip-country-region"), cidade: req.headers.get("x-vercel-ip-city"),
  } });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(VISITOR_COOKIE, visitanteId, { ...cookieOptions, maxAge: 365 * 86400 });
  response.cookies.set(SESSION_COOKIE, session, { ...cookieOptions, maxAge: 1800 });
  if (resolvedExplicit) response.cookies.set(TRACKING_COOKIE, await signReferral(resolvedExplicit.ref), { ...cookieOptions, maxAge: TRACKING_TTL });
  return response;
}

async function GETHandler(req: NextRequest) {
  const catalogo = req.nextUrl.searchParams.get("catalogo");
  if (catalogo && !["VAREJO", "ATACADO", "FABRICA"].includes(catalogo)) return NextResponse.json({ erro: "Catálogo inválido" }, { status: 400 });
  const visitas = await prisma.visita.groupBy({ by: ["estado"], where: { ...(catalogo ? { catalogo: catalogo as any } : {}), estado: { not: null } }, _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 20 });
  return NextResponse.json(visitas.map(v => ({ estado: v.estado, visitas: v._count.id })));
}

export const POST = withApiAccess(POSTHandler);
export const GET = withApiAccess(GETHandler);
