import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const telefone = searchParams.get("telefone");
  const catalogo = searchParams.get("catalogo");

  // Busca pública por telefone (para login rápido no RegistroWall)
  if (telefone && catalogo) {
    const normalizado = telefone.replace(/\D/g, "");
    const lead = await prisma.leadAtacado.findFirst({
      where: {
        telefone: { contains: normalizado },
        catalogo: catalogo as "ATACADO" | "FABRICA",
      },
    });
    if (!lead) return NextResponse.json({ erro: "Telefone não encontrado." }, { status: 404 });
    return NextResponse.json({ id: lead.id, status: lead.status });
  }

  // Listagem admin (sem filtro)
  const leads = await prisma.leadAtacado.findMany({
    orderBy: { criadoEm: "desc" },
  });
  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  try {
    const { nome, telefone, instagram, catalogo } = await req.json();

    if (!nome || !telefone || !catalogo) {
      return NextResponse.json({ error: "nome, telefone e catalogo são obrigatórios" }, { status: 400 });
    }

    // Se telefone já existe para esse catálogo, retorna o lead existente
    const existe = await prisma.leadAtacado.findFirst({
      where: { telefone, catalogo },
    });
    if (existe) {
      return NextResponse.json({ id: existe.id, status: existe.status });
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      null;

    // Geolocação opcional
    let estado: string | null = null;
    if (ip && !ip.startsWith("127.") && !ip.startsWith("192.168.") && ip !== "::1") {
      try {
        const geo = await fetch(`http://ip-api.com/json/${ip}?fields=status,regionName`, {
          signal: AbortSignal.timeout(3000),
        });
        const d = await geo.json();
        if (d.status === "success") estado = d.regionName ?? null;
      } catch { /* ignora */ }
    }

    const lead = await prisma.leadAtacado.create({
      data: { nome, telefone, instagram: instagram || null, catalogo, ip, estado, status: "ATIVO" },
    });

    return NextResponse.json({ id: lead.id, status: lead.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
