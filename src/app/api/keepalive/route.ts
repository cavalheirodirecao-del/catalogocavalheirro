import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Rota pública chamada pelo GitHub Actions a cada 12h para manter o banco ativo
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, ts: new Date().toISOString() });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
