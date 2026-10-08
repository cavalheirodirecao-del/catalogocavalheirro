import { NextRequest, NextResponse } from "next/server";
import { withApiAccess, currentActor } from "@/lib/api-access";
import { prisma } from "@/lib/prisma";

const catalogo: Record<string, string[]> = {
  "Camisetas": ["T-SHIRT OVERSIZED", "T-SHIRT VISCOLYCRA ESTAMPADA", "TSHIRT-DIFERENCIADAS", "T-SHIRT ALGODÃO-ESTAMPADA", "T-SHIRT-BASICA", "T-SHIRT-SUEDINE-BASICA", "T-SHIRT-COTTON-ESTAMPADA", "T-SHIRT-BASICA-PLUS"],
  "Camisas": ["CAMISA-MC-DIFERENCIADA", "CAMISA-ML-TECNOLOGICA", "CAMISA-ML-LISA-TRICOLINE", "CAMISA-MC-DELUXE", "CAMISA-MC-LISA-TRICOLINE", "CAMISA-ML-LINHO", "CAMISA-MC-PLUS-LISA", "CAMISA-MC-VISCOLINHO", "CAMISA-TEXTURIZADO"],
  "Gola Polo": ["GOLA-POLO-SUEDINE-PREMIUM", "GOLA-POLO-TEXTURIZADA", "POLO-LISTRADA", "POLO-PIQUET", "POLO-CONFORT-PREMIUM"],
  "Bermudas": ["BERMUDA-MOLETOM", "BERMUDAS-BRIM", "BERMUDA-LINHO"],
  "Mês do Consumidor": [], "Nécessaire": [], "Infantil": [], "Boné": [], "Cueca": [], "Conjunto": [], "Inverno": [], "Calça": [],
};

async function POSTHandler(req: NextRequest) {
  const actor = await currentActor(req);
  if (actor?.perfil !== "ADMIN") return NextResponse.json({ erro: "Apenas administradores podem executar este cadastro." }, { status: 403 });
  let grupos = 0, subGrupos = 0;
  for (const [nome, subs] of Object.entries(catalogo)) {
    const grupo = await prisma.grupo.upsert({ where: { nome }, update: {}, create: { nome } });
    if (!grupo) continue;
    grupos++;
    for (const subNome of subs) {
      await prisma.subGrupo.upsert({ where: { grupoId_nome: { grupoId: grupo.id, nome: subNome } }, update: {}, create: { grupoId: grupo.id, nome: subNome } });
      subGrupos++;
    }
  }
  return NextResponse.json({ ok: true, grupos, subGrupos });
}

export const POST = withApiAccess(POSTHandler);
