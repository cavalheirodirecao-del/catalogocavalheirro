"use client";

import { useEffect, useState } from "react";
import { Wallet, CheckCircle, Clock } from "lucide-react";
import { formatarMoeda } from "@/lib/utils";

interface ItemRelatorio {
  afiliadoId: string;
  nome: string;
  slug: string;
  qtdPedidos: number;
  totalVendas: number;
  tier: { pct: number; faixa: string };
  comissao: number;
  pagamentoId: string | null;
  statusPagamento: string | null;
  obsPagamento: string | null;
}

function mesAtual() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatarMes(mes: string) {
  const [ano, m] = mes.split("-");
  const nomes = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${nomes[Number(m) - 1]} ${ano}`;
}

export default function AfiliadosPagamentosPage() {
  const [mes, setMes] = useState(mesAtual());
  const [relatorio, setRelatorio] = useState<ItemRelatorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState<string | null>(null);

  async function carregar() {
    setLoading(true);
    const data = await fetch(`/api/afiliados/pagamentos?mes=${mes}`).then(r => r.json());
    setRelatorio(data.relatorio ?? []);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, [mes]);

  async function gerarEMarcarPago(item: ItemRelatorio) {
    setSalvando(item.afiliadoId);
    // Gera / atualiza pagamento
    const res = await fetch("/api/afiliados/pagamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        afiliadoId: item.afiliadoId,
        periodo: mes,
        valor: item.comissao,
        qtdPedidos: item.qtdPedidos,
      }),
    });
    const pg = await res.json();

    // Marca como PAGO
    await fetch(`/api/afiliados/pagamentos/${pg.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PAGO" }),
    });

    await carregar();
    setSalvando(null);
  }

  const totalComissoes = relatorio.reduce((acc, r) => acc + r.comissao, 0);
  const totalPago = relatorio
    .filter(r => r.statusPagamento === "PAGO")
    .reduce((acc, r) => acc + r.comissao, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet size={22} />
            Pagamentos de Comissão
          </h1>
          <p className="text-gray-500 text-sm mt-1">Relatório mensal de comissões por afiliado</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">Mês:</label>
          <input
            type="month"
            value={mes}
            onChange={e => setMes(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-1">Mês</p>
          <p className="text-lg font-bold">{formatarMes(mes)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-1">Total a pagar</p>
          <p className="text-lg font-bold text-amber-600">{formatarMoeda(totalComissoes)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-1">Já pago</p>
          <p className="text-lg font-bold text-green-600">{formatarMoeda(totalPago)}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
        </div>
      ) : relatorio.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Wallet size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum afiliado aprovado com vendas em {formatarMes(mes)}.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-600">Afiliado</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Vendas</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Tier</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Total vendido</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Comissão</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {relatorio.map(item => (
                <tr key={item.afiliadoId} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{item.nome}</p>
                    <p className="text-xs text-gray-400 font-mono">/{item.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold">{item.qtdPedidos}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                      {item.tier.pct}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">{formatarMoeda(item.totalVendas)}</td>
                  <td className="px-4 py-3 text-right font-bold text-amber-600">{formatarMoeda(item.comissao)}</td>
                  <td className="px-4 py-3 text-center">
                    {item.statusPagamento === "PAGO" ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        <CheckCircle size={11} />
                        Pago
                      </span>
                    ) : item.qtdPedidos > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                        <Clock size={11} />
                        Pendente
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {item.qtdPedidos > 0 && item.statusPagamento !== "PAGO" && (
                      <button
                        onClick={() => gerarEMarcarPago(item)}
                        disabled={salvando === item.afiliadoId}
                        className="text-xs bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 whitespace-nowrap"
                      >
                        {salvando === item.afiliadoId ? "..." : "Marcar pago"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
