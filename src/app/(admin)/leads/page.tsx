"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, X, Shield, ShieldOff } from "lucide-react";

interface Lead {
  id: string;
  nome: string;
  telefone: string;
  instagram: string | null;
  catalogo: string;
  estado: string | null;
  status: "ATIVO" | "BLOQUEADO";
  criadoEm: string;
}

function formatData(d: string) {
  return new Date(d).toLocaleDateString("pt-BR");
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroCatalogo, setFiltroCatalogo] = useState("");

  useEffect(() => {
    fetch("/api/leads")
      .then(r => r.json())
      .then(data => { setLeads(data); setLoading(false); });
  }, []);

  async function toggleStatus(id: string, atual: "ATIVO" | "BLOQUEADO") {
    const novoStatus = atual === "ATIVO" ? "BLOQUEADO" : "ATIVO";
    setToggling(id);
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novoStatus }),
    });
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: novoStatus } : l));
    setToggling(null);
  }

  const filtrados = useMemo(() => {
    let lista = leads;
    if (busca.trim()) {
      const t = busca.toLowerCase();
      lista = lista.filter(l =>
        l.nome.toLowerCase().includes(t) ||
        l.telefone.includes(t) ||
        (l.instagram ?? "").toLowerCase().includes(t)
      );
    }
    if (filtroStatus) lista = lista.filter(l => l.status === filtroStatus);
    if (filtroCatalogo) lista = lista.filter(l => l.catalogo === filtroCatalogo);
    return lista;
  }, [leads, busca, filtroStatus, filtroCatalogo]);

  const totalAtivos = leads.filter(l => l.status === "ATIVO").length;
  const totalBloqueados = leads.filter(l => l.status === "BLOQUEADO").length;
  const temFiltro = busca || filtroStatus || filtroCatalogo;

  const selectCls = "border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-gray-500 text-sm">
            {loading ? "Carregando..." : `${filtrados.length} de ${leads.length} cadastros`}
          </p>
        </div>
      </div>

      {/* Cards */}
      {!loading && (
        <div className="grid grid-cols-2 gap-3 max-w-xs">
          <button onClick={() => setFiltroStatus(filtroStatus === "ATIVO" ? "" : "ATIVO")}
            className={`rounded-xl border p-4 text-left transition ${filtroStatus === "ATIVO" ? "border-green-500 bg-green-50" : "bg-white border-gray-100 hover:border-gray-300"}`}>
            <p className="text-2xl font-bold text-green-700">{totalAtivos}</p>
            <p className="text-xs text-gray-400 mt-0.5">Ativos</p>
          </button>
          <button onClick={() => setFiltroStatus(filtroStatus === "BLOQUEADO" ? "" : "BLOQUEADO")}
            className={`rounded-xl border p-4 text-left transition ${filtroStatus === "BLOQUEADO" ? "border-red-500 bg-red-50" : "bg-white border-gray-100 hover:border-gray-300"}`}>
            <p className="text-2xl font-bold text-red-600">{totalBloqueados}</p>
            <p className="text-xs text-gray-400 mt-0.5">Bloqueados</p>
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome, telefone ou Instagram..."
            className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} className={selectCls}>
            <option value="">Todos os status</option>
            <option value="ATIVO">Ativo</option>
            <option value="BLOQUEADO">Bloqueado</option>
          </select>
          <select value={filtroCatalogo} onChange={e => setFiltroCatalogo(e.target.value)} className={selectCls}>
            <option value="">Todos catálogos</option>
            <option value="ATACADO">Atacado</option>
            <option value="FABRICA">Fábrica</option>
          </select>
          {temFiltro && (
            <button onClick={() => { setBusca(""); setFiltroStatus(""); setFiltroCatalogo(""); }}
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-black border border-gray-200 rounded-lg px-3 py-2 transition">
              <X size={12} /> Limpar
            </button>
          )}
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Telefone</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Instagram</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Catálogo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Data</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtrados.map(l => (
                <tr key={l.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium">{l.nome}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{l.telefone}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {l.instagram ? (
                      <a href={`https://instagram.com/${l.instagram.replace("@", "")}`} target="_blank" rel="noreferrer"
                        className="text-blue-600 hover:underline">{l.instagram}</a>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                      {l.catalogo === "ATACADO" ? "Atacado" : "Fábrica"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{l.estado ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{formatData(l.criadoEm)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${l.status === "ATIVO" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {l.status === "ATIVO" ? "Ativo" : "Bloqueado"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleStatus(l.id, l.status)}
                      disabled={toggling === l.id}
                      title={l.status === "ATIVO" ? "Bloquear acesso" : "Desbloquear acesso"}
                      className="text-gray-400 hover:text-black transition disabled:opacity-40"
                    >
                      {l.status === "ATIVO"
                        ? <ShieldOff size={16} />
                        : <Shield size={16} className="text-green-600" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filtrados.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            {temFiltro ? (
              <>
                <p className="font-medium">Nenhum lead encontrado</p>
                <button onClick={() => { setBusca(""); setFiltroStatus(""); setFiltroCatalogo(""); }}
                  className="text-sm text-black underline mt-2">Limpar filtros</button>
              </>
            ) : "Nenhum cadastro ainda."}
          </div>
        )}
      </div>
    </div>
  );
}
