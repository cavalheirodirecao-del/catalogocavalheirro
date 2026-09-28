import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { currentActor, withApiAccess } from "@/lib/api-access";
import { exclusiveAccess } from "@/lib/exclusive-access";
import { prisma } from "@/lib/prisma";
export const GET = withApiAccess(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const actor = await currentActor(req);
  if (!actor || !["ADMIN", "GERENTE"].includes(actor.perfil)) {
    if (!await exclusiveAccess(req)) return NextResponse.json({ erro: "Acesso exclusivo não autorizado." }, { status: 403 });
  }
  const job = await prisma.catalogoJob.findUnique({ where: { id: params.id } });
  if (!job || job.tabelaPreco !== "FABRICA" || job.status !== "CONCLUIDO") return NextResponse.json({ erro: "Catálogo não encontrado." }, { status: 404 });
  const storage = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data, error } = await storage.storage.from("catalogos-exclusivos").download("catalogos/" + job.id + ".pdf");
  if (error || !data) return NextResponse.json({ erro: "Arquivo indisponível." }, { status: 404 });
  return new NextResponse(await data.arrayBuffer(), { headers: { "Content-Type": "application/pdf", "Content-Disposition": "inline; filename=catalogo-exclusivo.pdf" } });
});
