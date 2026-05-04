"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, TrendingUp, Users, UserPlus, MapPin } from "lucide-react";

type Periodo = "diario" | "semanal" | "mensal" | "anual";

const PERIODOS: { key: Periodo; label: string }[] = [
  { key: "diario", label: "Hoje" },
  { key: "semanal", label: "Esta semana" },
  { key: "mensal", label: "Este mês" },
  { key: "anual", label: "Este ano" },
];

function formatMoeda(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

interface DashData {
  pedidos: number;
  faturamento: number;
  ticketMedio: number;
  leads: number;
  vendedores: { nome: string; pedidos: number; faturamento: number; pendentes: number }[];
  visitasPorEstado: { estado: string; visitas: number }[];
  serie: { label: string; pedidos: number; faturamento: number }[];
}

export default function DashboardPage() {
  const [periodo, setPeriodo] = useState<Periodo>("mensal");
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard?periodo=${periodo}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, [periodo]);

  const maxBarPedidos = data ? Math.max(...data.serie.map(s => s.pedidos), 1) : 1;

  return (
    <div className="space-y-6">
      {/* ── Cabeçalho + seletor de período ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500 text-sm">Visão geral do negócio</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {PERIODOS.map(p => (
            <button key={p.key} onClick={() => setPeriodo(p.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${periodo === p.key ? "bg-white shadow text-black" : "text-gray-500 hover:text-black"}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: ShoppingCart, cor: "bg-blue-50 text-blue-600", titulo: "Pedidos", valor: loading ? "—" : String(data?.pedidos ?? 0), sub: "no período" },
          { icon: TrendingUp, cor: "bg-green-50 text-green-600", titulo: "Faturamento", valor: loading ? "—" : formatMoeda(data?.faturamento ?? 0), sub: "confirmados+" },
          { icon: Users, cor: "bg-purple-50 text-purple-600", titulo: "Ticket Médio", valor: loading ? "—" : formatMoeda(data?.ticketMedio ?? 0), sub: "por pedido" },
          { icon: UserPlus, cor: "bg-orange-50 text-orange-600", titulo: "Novos Leads", valor: loading ? "—" : String(data?.leads ?? 0), sub: "cadastros no período" },
        ].map(({ icon: Icon, cor, titulo, valor, sub }) => (
          <div key={titulo} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className={`inline-flex p-2 rounded-lg ${cor} mb-3`}><Icon size={20} /></div>
            <p className="text-2xl font-bold">{valor}</p>
            <p className="text-sm font-medium text-gray-700 mt-0.5">{titulo}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Gráfico de barras (pedidos) ── */}
      {data && data.serie.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Pedidos — {PERIODOS.find(p => p.key === periodo)?.label}</h2>
          <div className="flex items-end gap-1 h-32 overflow-x-auto">
            {data.serie.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1 min-w-[20px] flex-1">
                <div
                  className="w-full bg-black rounded-t-sm transition-all"
                  style={{ height: `${Math.round((s.pedidos / maxBarPedidos) * 96)}px`, minHeight: s.pedidos > 0 ? "4px" : "0" }}
                  title={`${s.label}: ${s.pedidos} pedidos`}
                />
                {data.serie.length <= 31 && (
                  <span className="text-[9px] text-gray-400 rotate-0 leading-none">{s.label}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ── Melhores vendedores ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Melhores Vendedores</h2>
          {loading ? (
            <p className="text-gray-400 text-sm">Carregando...</p>
          ) : (data?.vendedores.length ?? 0) === 0 ? (
            <p className="text-gray-400 text-sm">Nenhum pedido com vendedor no período.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-2 font-medium">Vendedor</th>
                  <th className="pb-2 font-medium text-right">Pedidos</th>
                  <th className="pb-2 font-medium text-right">Faturamento</th>
                  <th className="pb-2 font-medium text-right">Pendentes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data?.vendedores.map((v, i) => (
                  <tr key={i}>
                    <td className="py-2 font-medium">{v.nome}</td>
                    <td className="py-2 text-right text-gray-600">{v.pedidos}</td>
                    <td className="py-2 text-right font-medium text-green-700">{formatMoeda(v.faturamento)}</td>
                    <td className="py-2 text-right">
                      {v.pendentes > 0
                        ? <span className="text-yellow-600 font-medium">{v.pendentes}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Visitas por estado ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={15} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">Visitas por Estado</h2>
          </div>
          {loading ? (
            <p className="text-gray-400 text-sm">Carregando...</p>
          ) : (data?.visitasPorEstado.length ?? 0) === 0 ? (
            <p className="text-gray-400 text-sm">Nenhuma visita registrada no período.</p>
          ) : (
            <div className="space-y-2">
              {data?.visitasPorEstado.slice(0, 10).map((v, i) => {
                const max = data.visitasPorEstado[0]?.visitas ?? 1;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 w-28 truncate">{v.estado}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="bg-black h-2 rounded-full transition-all"
                        style={{ width: `${Math.round((v.visitas / max) * 100)}%` }} />
                    </div>
                    <span className="text-xs font-medium text-gray-700 w-6 text-right">{v.visitas}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
