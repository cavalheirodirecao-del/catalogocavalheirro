import { prisma } from "@/lib/prisma";
import { formatarMoeda } from "@/lib/utils";
import { TipoCatalogo, StatusPedido } from "@prisma/client";

const labelCatalogo: Record<TipoCatalogo, string> = {
  VAREJO: "Varejo",
  ATACADO: "Atacado",
  FABRICA: "Fábrica",
};

export default async function RelatoriosPage() {
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const inicioMesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
  const fimMesPassado = new Date(hoje.getFullYear(), hoje.getMonth(), 0);

  const [
    faturamentoPorCatalogo,
    pedidosPorStatus,
    topVendedores,
    topProdutos,
    faturamentoMes,
    faturamentoMesPassado,
  ] = await Promise.all([
    // Faturamento por catálogo (mês atual)
    prisma.pedido.groupBy({
      by: ["catalogo"],
      _sum: { total: true },
      _count: true,
      where: {
        status: { in: ["CONFIRMADO", "SEPARANDO", "ENVIADO", "CONCLUIDO"] },
        criadoEm: { gte: inicioMes },
      },
    }),

    // Pedidos por status
    prisma.pedido.groupBy({
      by: ["status"],
      _count: true,
    }),

    // Top vendedores (mês atual)
    prisma.pedido.groupBy({
      by: ["vendedorId"],
      _sum: { total: true },
      _count: true,
      where: { criadoEm: { gte: inicioMes }, vendedorId: { not: null } },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    }),

    // Top produtos mais vendidos
    prisma.itemPedido.groupBy({
      by: ["varianteId"],
      _sum: { quantidade: true },
      orderBy: { _sum: { quantidade: "desc" } },
      take: 10,
    }),

    // Total mês atual
    prisma.pedido.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ["CONFIRMADO", "SEPARANDO", "ENVIADO", "CONCLUIDO"] },
        criadoEm: { gte: inicioMes },
      },
    }),

    // Total mês passado
    prisma.pedido.aggregate({
      _sum: { total: true },
      where: {
        status: { in: ["CONFIRMADO", "SEPARANDO", "ENVIADO", "CONCLUIDO"] },
        criadoEm: { gte: inicioMesPassado, lte: fimMesPassado },
      },
    }),
  ]);

  // Busca nomes dos vendedores
  const vendedorIds = topVendedores.map((v) => v.vendedorId).filter(Boolean) as string[];
  const vendedores = await prisma.vendedor.findMany({
    where: { id: { in: vendedorIds } },
    include: { usuario: true },
  });
  const mapaVendedores = Object.fromEntries(vendedores.map((v) => [v.id, v.usuario.nome]));

  // Busca detalhes das variantes mais vendidas
  const varianteIds = topProdutos.map((t) => t.varianteId);
  const variantes = await prisma.produtoVariante.findMany({
    where: { id: { in: varianteIds } },
    include: { produto: true, cor: true, gradeItem: true },
  });
  const mapaVariantes = Object.fromEntries(variantes.map((v) => [v.id, v]));

  const totalMes = Number(faturamentoMes._sum.total ?? 0);
  const totalMesPassado = Number(faturamentoMesPassado._sum.total ?? 0);
  const crescimento = totalMesPassado > 0
    ? ((totalMes - totalMesPassado) / totalMesPassado) * 100
    : null;

  const corStatus: Record<StatusPedido, string> = {
    PENDENTE: "bg-yellow-100 text-yellow-700",
    CONFIRMADO: "bg-blue-100 text-blue-700",
    SEPARANDO: "bg-purple-100 text-purple-700",
    ENVIADO: "bg-indigo-100 text-indigo-700",
    CONCLUIDO: "bg-green-100 text-green-700",
    CANCELADO: "bg-red-100 text-red-600",
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <p className="text-gray-500 text-sm">
          Período: {inicioMes.toLocaleDateString("pt-BR")} até hoje
        </p>
      </div>

      {/* Comparativo de faturamento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Faturamento este mês</p>
          <p className="text-2xl font-bold mt-1">{formatarMoeda(totalMes)}</p>
          {crescimento !== null && (
            <p className={`text-xs mt-1 ${crescimento >= 0 ? "text-green-600" : "text-red-500"}`}>
              {crescimento >= 0 ? "▲" : "▼"} {Math.abs(crescimento).toFixed(1)}% vs mês anterior
            </p>
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Mês anterior</p>
          <p className="text-2xl font-bold mt-1">{formatarMoeda(totalMesPassado)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Pedidos por status</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {pedidosPorStatus.map((s) => (
              <span key={s.status} className={`text-xs px-2 py-0.5 rounded-full font-medium ${corStatus[s.status as StatusPedido]}`}>
                {s.status.charAt(0) + s.status.slice(1).toLowerCase()} ({s._count})
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por catálogo */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold mb-4">Faturamento por Catálogo (mês)</h2>
          <div className="space-y-3">
            {faturamentoPorCatalogo.map((f) => (
              <div key={f.catalogo} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{labelCatalogo[f.catalogo]}</span>
                <div className="text-right">
                  <p className="font-semibold text-sm">{formatarMoeda(Number(f._sum.total ?? 0))}</p>
                  <p className="text-xs text-gray-400">{f._count} pedidos</p>
                </div>
              </div>
            ))}
            {faturamentoPorCatalogo.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">Sem dados neste período.</p>
            )}
          </div>
        </div>

        {/* Top vendedores */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold mb-4">Top Vendedores (mês)</h2>
          <div className="space-y-3">
            {topVendedores.map((v, i) => (
              <div key={v.vendedorId} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm">{mapaVendedores[v.vendedorId!] ?? "—"}</span>
                <div className="text-right">
                  <p className="font-semibold text-sm">{formatarMoeda(Number(v._sum.total ?? 0))}</p>
                  <p className="text-xs text-gray-400">{v._count} pedidos</p>
                </div>
              </div>
            ))}
            {topVendedores.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">Sem dados neste período.</p>
            )}
          </div>
        </div>

        {/* Top produtos */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 lg:col-span-2">
          <h2 className="font-semibold mb-4">Produtos Mais Vendidos</h2>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-2 font-medium text-gray-600">#</th>
                  <th className="text-left pb-2 font-medium text-gray-600">Produto</th>
                  <th className="text-left pb-2 font-medium text-gray-600">Cor</th>
                  <th className="text-left pb-2 font-medium text-gray-600">Tamanho</th>
                  <th className="text-right pb-2 font-medium text-gray-600">Qtd Vendida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topProdutos.map((t, i) => {
                  const v = mapaVariantes[t.varianteId];
                  if (!v) return null;
                  return (
                    <tr key={t.varianteId}>
                      <td className="py-2 text-gray-400">{i + 1}</td>
                      <td className="py-2 font-medium">{v.produto.nome}</td>
                      <td className="py-2 text-gray-500">{v.cor.nome}</td>
                      <td className="py-2 text-gray-500">{v.gradeItem.valor}</td>
                      <td className="py-2 text-right font-bold">{t._sum.quantidade}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {topProdutos.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">Nenhuma venda registrada.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
