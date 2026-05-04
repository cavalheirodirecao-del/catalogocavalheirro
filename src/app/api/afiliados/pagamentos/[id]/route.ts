import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/afiliados/pagamentos/[id] — marcar como pago / atualizar obs
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { status, obs } = await req.json();

  const data: any = {};
  if (status !== undefined) data.status = status;
  if (obs !== undefined) data.obs = obs || null;

  const pagamento = await prisma.pagamentoAfiliado.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(pagamento);
}
