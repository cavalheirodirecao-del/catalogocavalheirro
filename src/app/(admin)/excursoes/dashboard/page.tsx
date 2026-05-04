"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Truck, BarChart2, TrendingUp, AlertCircle, X } from "lucide-react";

const ESTADOS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

function formatMoeda(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

const selectCls = "border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white";

interface DashData {
  totalPedidos: number;
  volumeTotal: number;
  atrelados: number;
  naoAtrelados: number;
  ranking: { id: string; nome: string; pedidos: number; volume: number }[];
  naoRegistradas: { nome: string; count: number }[];
}

interface Vendedor { id: string; nome: string }

export default function ExcursoesDashboardPage() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);

  // Filtros
  const [dataInicio, setDataInicio]   = useState("");
  const [dataFim, setDataFim]         = useState("");
  const [estado, setEstado]           = useState("");
  const [cidade, setCidade]           = useState("");
  const [catalogo, setCatalogo]       = useState("");
  const [vendedorId, setVendedorId]   = useState("");

  // Ordenação do ranking
  const [sortBy, setSortBy] = useState<"pedidos" | "volume">("pedidos");

  const carregarVendedores = useCallback(async () => {
    const res = await fetch("/api/pedidos");
    const pedidos = await res.json();
    const map = new Map<string, string>();
    for (const p of pedidos) {
      if (p.vendedor) map.set(p.vendedor.id, p.vendedor.usuario.nome);
    }
    setVendedores(Array.from(map.entries()).map(([id, nome]) => ({ id, nome })).sort((a, b) => a.nome.localeCompare(b.nome)));
  }, []);

  const carregar = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (dataInicio) params.set("dataInicio", dataInicio);
    if (dataFim)    params.set("dataFim", dataFim);
    if (estado)     params.set("estado", estado);
    if (cidade)     params.set("cidade", cidade);
    if (catalogo)   params.set("catalogo", catalogo);
    if (vendedorId) params.set("vendedorId", vendedorId);
    const res = await fetch(`/api/excursoes/dashboard?${params}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [dataInicio, dataFim, estado, cidade, catalogo, vendedorId]);

  useEffect(() => {
    carregarVendedores();
    carregar();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function limpar() {
    setDataInicio(""); setDataFim(""); setEstado(""); setCidade(""); setCatalogo(""); setVendedorId("");
    setLoading(true);
    const res = await fetch("/api/excursoes/dashboard");
    setData(await res.json());
    setLoading(false);
  }

  const temFiltro = dataInicio || dataFim || estado || cidade || catalogo || vendedorId;

  const rankingOrdenado = data
    ? [...data.ranking].sort((a, b) => b[sortBy] - a[sortBy])
    : [];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart2 size={22} /> Dashboard de Excursões
          </h1>
          <p className="text-gray-500 text-sm mt-1">Volume e parcerias por excursão</p>
        </div>
        <Link href="/excursoes"
          className="text-sm text-gray-500 hover:text-gray-800 transition flex items-center gap-1">
          <Truck size={14} /> Cadastro
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)}
            className={selectCls} title="Data início" />
          <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)}
            className={selectCls} title="Data fim" />

          <select value={estado} onChange={e => setEstado(e.target.value)} className={selectCls}>
            <option value="">Todos os estados</option>
            {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
          </select>

          <input type="text" value={cidade} onChange={e => setCidade(e.target.value)}
            placeholder="Cidade..." className={selectCls} />

          <select value={catalogo} onChange={e => setCatalogo(e.target.value)} className={selectCls}>
            <option value="">Todos catálogos</option>
            <option value="VAREJO">Varejo</option>
            <option value="ATACADO">Atacado</option>
            <option value="FABRICA">Fábrica</option>
          </select>

          <select value={vendedorId} onChange={e => setVendedorId(e.target.value)} className={selectCls}>
            <option value="">Todos vendedores</option>
            {vendedores.map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={carregar}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
            Filtrar
          </button>
          {temFiltro && (
            <button onClick={() => { limpar(); }} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-black transition">
              <X size={12} /> Limpar filtros
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
        </div>
      ) : data && (
        <>
          {/* Cards de resumo */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-400 mb-1">Total pedidos excursão</p>
              <p className="text-3xl font-bold text-gray-900">{data.totalPedidos}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-400 mb-1">Volume total</p>
              <p className="text-2xl font-bold text-green-600">{formatMoeda(data.volumeTotal)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-400 mb-1">Atrelados a excursão</p>
              <p className="text-3xl font-bold text-blue-600">{data.atrelados}</p>
              {data.totalPedidos > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  {Math.round((data.atrelados / data.totalPedidos) * 100)}% do total
                </p>
              )}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-400 mb-1">Sem vínculo</p>
              <p className={`text-3xl font-bold ${data.naoAtrelados > 0 ? "text-amber-500" : "text-gray-300"}`}>
                {data.naoAtrelados}
              </p>
              {data.naoAtrelados > 0 && (
                <Link href="/excursoes" className="text-xs text-amber-600 hover:underline mt-1 inline-block">
                  Ver cadastro →
                </Link>
              )}
            </div>
          </div>

          {/* Ranking de excursões cadastradas */}
          {rankingOrdenado.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <TrendingUp size={16} className="text-gray-400" />
                  Ranking de Excursões Cadastradas
                </h2>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-gray-400">Ordenar por:</span>
                  <button
                    onClick={() => setSortBy("pedidos")}
                    className={`px-2 py-1 rounded font-medium transition ${sortBy === "pedidos" ? "bg-black text-white" : "text-gray-500 hover:text-black"}`}>
                    Pedidos
                  </button>
                  <button
                    onClick={() => setSortBy("volume")}
                    className={`px-2 py-1 rounded font-medium transition ${sortBy === "volume" ? "bg-black text-white" : "text-gray-500 hover:text-black"}`}>
                    Volume R$
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-5 py-3 font-medium text-gray-600 w-8">#</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Excursão</th>
                      <th className="text-center px-4 py-3 font-medium text-gray-600">Pedidos</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">Volume</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">Ticket médio</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {rankingOrdenado.map((exc, i) => (
                      <tr key={exc.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3 text-gray-400 font-mono text-xs">{i + 1}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{exc.nome}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-bold text-gray-900">{exc.pedidos}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-green-600">
                          {formatMoeda(exc.volume)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500 text-xs">
                          {formatMoeda(exc.volume / exc.pedidos)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/excursoes/${exc.id}`}
                            className="text-xs text-gray-400 hover:text-gray-700 transition">
                            Ver →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
              <Truck size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum pedido vinculado a excursões cadastradas no período.</p>
            </div>
          )}

          {/* Excursões não cadastradas */}
          {data.naoRegistradas.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-500" />
                Excursões Não Cadastradas — Mais Frequentes
              </h2>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-5 py-3 font-medium text-gray-600">Nome informado pelo cliente</th>
                      <th className="text-center px-4 py-3 font-medium text-gray-600">Pedidos sem vínculo</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.naoRegistradas.map((nr, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-5 py-3 text-gray-700 font-medium">{nr.nome}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold text-sm ${nr.count >= 3 ? "text-amber-600" : "text-gray-500"}`}>
                            {nr.count}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href="/excursoes/novo"
                            className="text-xs text-black hover:underline font-medium">
                            Cadastrar →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400">
                Excursões com mais pedidos são boas candidatas a parcerias formais.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
