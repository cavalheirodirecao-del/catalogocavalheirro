import { withApiAccess } from "@/lib/api-access";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Rota pública chamada pelo GitHub Actions a cada 12h para manter o banco ativo
async function GETHandler() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, ts: new Date().toISOString() });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}

export const GET = withApiAccess(GETHandler);
