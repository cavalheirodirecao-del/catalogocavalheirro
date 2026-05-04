import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const jobs = await prisma.catalogoJob.findMany({
    orderBy: { criadoEm: "desc" },
    take: 50,
  });
  return NextResponse.json(jobs);
}
