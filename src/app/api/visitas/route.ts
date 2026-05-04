import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function geolocate(ip: string): Promise<{ pais: string | null; estado: string | null; cidade: string | null }> {
  // Ignora IPs locais
  if (!ip || ip === "::1" || ip.startsWith("127.") || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return { pais: null, estado: null, cidade: null };
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city`, {
      signal: AbortSignal.timeout(3000),
    });
    const data = await res.json();
    if (data.status === "success") {
      return { pais: data.country ?? null, estado: data.regionName ?? null, cidade: data.city ?? null };
    }
  } catch {
    // ignora erros de geolocação
  }
  return { pais: null, estado: null, cidade: null };
}

export async function POST(req: NextRequest) {
  try {
    const { catalogo, vendedorSlug } = await req.json();

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      null;

    let vendedorId: string | null = null;
    if (vendedorSlug) {
      const v = await prisma.vendedor.findUnique({ where: { slug: vendedorSlug }, select: { id: true } });
      vendedorId = v?.id ?? null;
    }

    const geo = ip ? await geolocate(ip) : { pais: null, estado: null, cidade: null };

    await prisma.visita.create({
      data: { catalogo, vendedorId, ip, ...geo },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const catalogo = searchParams.get("catalogo");

  const visitas = await prisma.visita.groupBy({
    by: ["estado"],
    where: {
      ...(catalogo ? { catalogo: catalogo as any } : {}),
      estado: { not: null },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 20,
  });

  return NextResponse.json(visitas.map(v => ({ estado: v.estado, visitas: v._count.id })));
}
