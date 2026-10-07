import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withApiAccess } from "@/lib/api-access";

async function GETHandler() {
  const produtos = await prisma.produto.findMany({
    where: { ativo: true },
    orderBy: { codigo: "asc" },
    include: { cores: { include: { variantes: { include: { gradeItem: true, estoque: true } } } } },
  });
  const linhas = ["Produto;Estoque Atual;Valor Venda Varejo;Valor Venda Atacado;Grandes Clientes Calculado (-15%);Grandes Clientes Sugerido"];
  for (const produto of produtos) for (const cor of produto.cores) for (const variante of cor.variantes) {
    const nome = `${produto.nome} - REF: ${produto.codigo} - ${variante.gradeItem.valor} (${cor.nome})`;
    const atacado = Number(produto.precoAtacadoVista);
    const calculado = atacado * 0.85;
    // Arredonda sempre para o próximo preço terminado em ,90.
    const sugerido = calculado > 0 ? Math.ceil(calculado - 0.9) + 0.9 : 0;
    linhas.push([nome, variante.estoque?.quantidade ?? 0, produto.precoVarejoVista, atacado, calculado.toFixed(2), sugerido.toFixed(2)]
      .map(valor => `"${String(valor).replace(/"/g, '""')}"`).join(";"));
  }
  return new NextResponse("\uFEFF" + linhas.join("\r\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="catalogo-cavalheiro.csv"' },
  });
}

export const GET = withApiAccess(GETHandler);
