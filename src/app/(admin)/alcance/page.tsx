"use client";

import { useEffect, useState, useCallback } from "react";
import { Signal, X } from "lucide-react";

const selectCls = "border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white";

function formatData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

interface RankingEntry {
  id: string;
  slug: string;
  nome: string;
  tipo: "VENDEDOR" | "AFILIADO";
  totalVisitas: number;
  ipsUnicos: number;
  ultimaVisita: string;
  porCatalogo: { VAREJO: number; ATACADO: number; FABRICA: number };
}

interface DashData {
  ranking: RankingEntry[];
  totais: { totalVisitas: number; ipsUnicos: number; vendedores: number; afiliados: number };
}

export default function AlcancePage() {
  const [data, setData]     = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim]       = useState("");
  const [catalogo, setCatalogo]     = useState("");
  const [tipo, setTipo]             = useState("");

  // Ordenação local
  const [sortBy, setSortBy] = useState<"ipsUnicos" | "totalVisitas">("ipsUnicos");

  const carregar = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (dataInicio) params.set("dataInicio", dataInicio);
    if (dataFim)    params.set("dataFim", dataFim);
    if (catalogo)   params.set("catalogo", catalogo);
    if (tipo)       params.set("tipo", tipo);
    const res  = await fetch(`/api/admin/alcance?${params}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [dataInicio, dataFim, catalogo, tipo]);

  useEffect(() => { carregar(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function limpar() {
    setDataInicio(""); setDataFim(""); setCatalogo(""); setTipo("");
    setLoading(true);
    const res  = await fetch("/api/admin/alcance");
    setData(await res.json());
    setLoading(false);
  }

  const temFiltro = dataInicio || dataFim || catalogo || tipo;

  const ranking = data
    ? [...data.ranking].sort((a, b) => b[sortBy] - a[sortBy])
    : [];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Signal size={22} /> Alcance
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Quantas pessoas cada vendedor ou afiliado trouxe ao catálogo — independente de venda
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)}
            className={selectCls} title="Data início" />
          <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)}
            className={selectCls} title="Data fim" />
          <select value={catalogo} onChange={e => setCatalogo(e.target.value)} className={selectCls}>
            <option value="">Todos os catálogos</option>
            <option value="VAREJO">Varejo</option>
            <option value="ATACADO">Atacado</option>
            <option value="FABRICA">Fábrica</option>
          </select>
          <select value={tipo} onChange={e => setTipo(e.target.value)} className={selectCls}>
            <option value="">Vendedores e Afiliados</option>
            <option value="VENDEDOR">Vendedores</option>
            <option value="AFILIADO">Afiliados</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={carregar}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
            Filtrar
          </button>
          {temFiltro && (
            <button onClick={limpar}
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-black transition">
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
              <p className="text-xs text-gray-400 mb-1">Total de visitas</p>
              <p className="text-3xl font-bold text-gray-900">{data.totais.totalVisitas}</p>
              <p className="text-xs text-gray-400 mt-1">acessos registrados</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-400 mb-1">IPs únicos</p>
              <p className="text-3xl font-bold text-black">{data.totais.ipsUnicos}</p>
              <p className="text-xs text-gray-400 mt-1">dispositivos diferentes</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-400 mb-1">Vendedores ativos</p>
              <p className="text-3xl font-bold text-blue-600">{data.totais.vendedores}</p>
              <p className="text-xs text-gray-400 mt-1">com visitas no período</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-400 mb-1">Afiliados ativos</p>
              <p className="text-3xl font-bold text-purple-600">{data.totais.afiliados}</p>
              <p className="text-xs text-gray-400 mt-1">com visitas no período</p>
            </div>
          </div>

          {/* Ranking */}
          {ranking.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">Ranking de Alcance</h2>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-gray-400">Ordenar por:</span>
                  <button onClick={() => setSortBy("ipsUnicos")}
                    className={`px-2 py-1 rounded font-medium transition ${sortBy === "ipsUnicos" ? "bg-black text-white" : "text-gray-500 hover:text-black"}`}>
                    IPs únicos
                  </button>
                  <button onClick={() => setSortBy("totalVisitas")}
                    className={`px-2 py-1 rounded font-medium transition ${sortBy === "totalVisitas" ? "bg-black text-white" : "text-gray-500 hover:text-black"}`}>
                    Total visitas
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left px-4 py-3 font-medium text-gray-600 w-8">#</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
                        <th className="text-center px-4 py-3 font-medium text-gray-600">IPs únicos</th>
                        <th className="text-center px-4 py-3 font-medium text-gray-600">Total</th>
                        <th className="text-center px-4 py-3 font-medium text-gray-500 text-xs">Varejo</th>
                        <th className="text-center px-4 py-3 font-medium text-gray-500 text-xs">Atacado</th>
                        <th className="text-center px-4 py-3 font-medium text-gray-500 text-xs">Fábrica</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600">Última visita</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {ranking.map((entry, i) => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-400 font-mono text-xs">{i + 1}</td>
                          <td className="px-4 py-3 font-semibold text-gray-900">{entry.nome}</td>
                          <td className="px-4 py-3">
                            {entry.tipo === "VENDEDOR" ? (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                Vendedor
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                Afiliado
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                              {entry.slug}
                            </code>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="font-bold text-base text-gray-900">{entry.ipsUnicos}</span>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-500">{entry.totalVisitas}</td>
                          <td className="px-4 py-3 text-center text-xs text-gray-500">
                            {entry.porCatalogo.VAREJO || "—"}
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-gray-500">
                            {entry.porCatalogo.ATACADO || "—"}
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-gray-500">
                            {entry.porCatalogo.FABRICA || "—"}
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-gray-400">
                            {formatData(entry.ultimaVisita)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
              <Signal size={36} className="mx-auto mb-3 text-gray-200" />
              <p className="text-sm text-gray-400 font-medium">Nenhuma visita registrada no período.</p>
              <p className="text-xs text-gray-400 mt-1">
                As visitas começam a aparecer quando alguém acessa o catálogo via link de vendedor ou afiliado.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
