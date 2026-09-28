import { withApiAccess } from "@/lib/api-access";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentActor } from "@/lib/api-access";
import { buildReachReport } from "@/lib/reach-report";

async function GETHandler(req: NextRequest) {
  const actor = await currentActor(req);
  if (!actor) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  const ownId = actor.perfil === "VENDEDOR" ? actor.vendedor?.id : null;
  if (actor.perfil === "VENDEDOR" && !ownId) return NextResponse.json({ erro: "Vendedor não encontrado." }, { status: 403 });
  const p = req.nextUrl.searchParams;
  const catalogo = p.get("catalogo");
  const tipo = ownId ? "VENDEDOR" : p.get("tipo");
  const inicio = p.get("dataInicio");
  const fim = p.get("dataFim");
  if ((catalogo && !["VAREJO","ATACADO","FABRICA"].includes(catalogo)) || (tipo && !["VENDEDOR","AFILIADO"].includes(tipo))) return NextResponse.json({ erro: "Filtro inválido." }, { status: 400 });
  const start = inicio ? new Date(inicio + "T00:00:00-03:00") : null;
  const end = fim ? new Date(fim + "T23:59:59.999-03:00") : null;
  if ((start && isNaN(+start)) || (end && isNaN(+end)) || (start && end && start > end)) return NextResponse.json({ erro: "Período inválido." }, { status: 400 });
  const where = {
    ...(ownId ? { vendedorId: ownId } : tipo === "VENDEDOR" ? { vendedorId: { not: null } } : tipo === "AFILIADO" ? { afiliadoId: { not: null } } : { OR: [{ vendedorId: { not: null } }, { afiliadoId: { not: null } }] }),
    ...(catalogo ? { catalogo: catalogo as any } : {}),
    ...(start || end ? { criadoEm: { ...(start ? { gte: start } : {}), ...(end ? { lte: end } : {}) } } : {}),
  };
  const [vendedores, afiliados, visits, orders] = await Promise.all([
    tipo === "AFILIADO" ? [] : prisma.vendedor.findMany({ where: ownId ? { id: ownId } : {}, select: { id: true, slug: true, ativo: true, links: { where: { ativo: true }, select: { catalogo: true } }, usuario: { select: { nome: true } } } }),
    tipo === "VENDEDOR" ? [] : prisma.afiliado.findMany({ select: { id: true, slug: true, usuario: { select: { nome: true } } } }),
    prisma.visita.findMany({ where, select: { vendedorId: true, afiliadoId: true, visitanteId: true, ip: true, catalogo: true, criadoEm: true } }),
    prisma.pedido.findMany({ where, select: { vendedorId: true, afiliadoId: true, status: true, total: true, origemRastreamento: true } }),
  ]);
  // Orders can have an affiliate origin and a manually selected seller. For the combined
  // ranking each participant gets credit, but global totals count each order only once.
  const result = buildReachReport([
    ...vendedores.map(v=>({ id:v.id, slug:v.slug, nome:v.usuario.nome, tipo:"VENDEDOR" as const })),
    ...afiliados.map(a=>({ id:a.id, slug:a.slug, nome:a.usuario.nome, tipo:"AFILIADO" as const })),
  ], visits, orders);
  result.totais.totalPedidos = orders.length;
  result.totais.compras = orders.filter(o=>["CONFIRMADO","SEPARANDO","ENVIADO","CONCLUIDO"].includes(o.status)).length;
  result.totais.valorCompras = orders.filter(o=>["CONFIRMADO","SEPARANDO","ENVIADO","CONCLUIDO"].includes(o.status)).reduce((n,o)=>n+Number(o.total),0);
  return NextResponse.json({ ...result, somenteMeus: !!ownId, links: ownId ? vendedores.flatMap(v=>v.links.map(l=>({ catalogo:l.catalogo, caminho:"/" + l.catalogo.toLowerCase() + "?vendedor=" + encodeURIComponent(v.slug) }))) : [] });
}

export const GET = withApiAccess(GETHandler);
