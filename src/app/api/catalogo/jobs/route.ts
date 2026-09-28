import { withApiAccess } from "@/lib/api-access";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function GETHandler() {
  const jobs = await prisma.catalogoJob.findMany({
    orderBy: { criadoEm: "desc" },
    take: 50,
  });
  return NextResponse.json(jobs);
}

export const GET = withApiAccess(GETHandler);
