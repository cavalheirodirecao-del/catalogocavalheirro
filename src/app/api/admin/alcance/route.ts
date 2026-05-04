import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dataInicio = searchParams.get("dataInicio");
  const dataFim    = searchParams.get("dataFim");
  const catalogo   = searchParams.get("catalogo") ?? "";
  const tipo       = searchParams.get("tipo") ?? ""; // "VENDEDOR" | "AFILIADO" | ""

  const visitas = await prisma.visita.findMany({
    where: {
      OR: [{ vendedorId: { not: null } }, { afiliadoId: { not: null } }],
      ...(catalogo ? { catalogo: catalogo as any } : {}),
      ...(dataInicio || dataFim
        ? {
            criadoEm: {
              ...(dataInicio ? { gte: new Date(dataInicio) } : {}),
              ...(dataFim    ? { lte: new Date(dataFim + "T23:59:59") } : {}),
            },
          }
        : {}),
    },
    select: {
      ip:        true,
      catalogo:  true,
      criadoEm: true,
      vendedorId: true,
      vendedor:  { select: { slug: true, usuario: { select: { nome: true } } } },
      afiliadoId: true,
      afiliado:  { select: { slug: true, usuario: { select: { nome: true } } } },
    },
    orderBy: { criadoEm: "desc" },
  });

  // Agrupa em memória para calcular IPs únicos por pessoa
  type Entry = {
    id: string;
    slug: string;
    nome: string;
    tipo: "VENDEDOR" | "AFILIADO";
    totalVisitas: number;
    ips: Set<string>;
    ultimaVisita: Date;
    porCatalogo: { VAREJO: number; ATACADO: number; FABRICA: number };
  };

  const mapa = new Map<string, Entry>();

  for (const v of visitas) {
    const isVendedor = v.vendedorId !== null;
    const isAfiliado = v.afiliadoId !== null;
    if (!isVendedor && !isAfiliado) continue;

    const chave = isVendedor ? `V:${v.vendedorId}` : `A:${v.afiliadoId}`;
    const tipoEntry: "VENDEDOR" | "AFILIADO" = isVendedor ? "VENDEDOR" : "AFILIADO";

    if (!mapa.has(chave)) {
      mapa.set(chave, {
        id:    (isVendedor ? v.vendedorId : v.afiliadoId) as string,
        slug:  (isVendedor ? v.vendedor?.slug : v.afiliado?.slug) ?? "",
        nome:  (isVendedor ? v.vendedor?.usuario.nome : v.afiliado?.usuario.nome) ?? "—",
        tipo:  tipoEntry,
        totalVisitas: 0,
        ips:   new Set<string>(),
        ultimaVisita: v.criadoEm,
        porCatalogo: { VAREJO: 0, ATACADO: 0, FABRICA: 0 },
      });
    }

    const entry = mapa.get(chave)!;
    entry.totalVisitas++;
    if (v.ip) entry.ips.add(v.ip);
    if (v.criadoEm > entry.ultimaVisita) entry.ultimaVisita = v.criadoEm;
    entry.porCatalogo[v.catalogo as "VAREJO" | "ATACADO" | "FABRICA"]++;
  }

  // Monta array e aplica filtro de tipo
  let ranking = Array.from(mapa.values())
    .filter(e => !tipo || e.tipo === tipo)
    .map(e => ({
      id:           e.id,
      slug:         e.slug,
      nome:         e.nome,
      tipo:         e.tipo,
      totalVisitas: e.totalVisitas,
      ipsUnicos:    e.ips.size,
      ultimaVisita: e.ultimaVisita.toISOString(),
      porCatalogo:  e.porCatalogo,
    }))
    .sort((a, b) => b.ipsUnicos - a.ipsUnicos);

  // Totais globais
  const todosIps = new Set<string>();
  for (const v of visitas) { if (v.ip) todosIps.add(v.ip); }

  const vendedoresSet = new Set(ranking.filter(r => r.tipo === "VENDEDOR").map(r => r.id));
  const afiliadosSet  = new Set(ranking.filter(r => r.tipo === "AFILIADO").map(r => r.id));

  return NextResponse.json({
    ranking,
    totais: {
      totalVisitas: visitas.length,
      ipsUnicos:    todosIps.size,
      vendedores:   vendedoresSet.size,
      afiliados:    afiliadosSet.size,
    },
  });
}
