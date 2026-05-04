"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Power, Search, X, SlidersHorizontal } from "lucide-react";
import { formatarMoeda } from "@/lib/utils";

interface Grupo { id: string; nome: string; subGrupos: { id: string; nome: string }[] }

interface Produto {
  id: string;
  codigo: string;
  nome: string;
  ativo: boolean;
  criadoEm: string;
  grupo: { id: string; nome: string } | null;
  subGrupo: { id: string; nome: string } | null;
  precoVarejoVista: number;
  precoAtacadoVista: number;
  precoFabricaVista: number;
}

const FILTRO_INICIAL = {
  codigo: "", nome: "", grupoId: "", subGrupoId: "",
  status: "todos", dataInicio: "", dataFim: "",
};

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const [filtros, setFiltros] = useState({ ...FILTRO_INICIAL });
  const [filtrosAtivos, setFiltrosAtivos] = useState({ ...FILTRO_INICIAL });

  useEffect(() => {
    Promise.all([
      fetch("/api/produtos").then(r => r.json()),
      fetch("/api/grupos?admin=1").then(r => r.json()),
    ]).then(([prods, grps]) => {
      setProdutos(prods);
      setGrupos(grps);
      setLoading(false);
    });
  }, []);

  async function toggleAtivo(id: string, ativo: boolean) {
    setToggling(id);
    await fetch(`/api/produtos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !ativo }),
    });
    setProdutos(prev => prev.map(p => p.id === id ? { ...p, ativo: !ativo } : p));
    setToggling(null);
  }

  const subGruposFiltro = filtros.grupoId
    ? grupos.find(g => g.id === filtros.grupoId)?.subGrupos ?? []
    : [];

  function aplicarFiltros() {
    setFiltrosAtivos({ ...filtros });
  }

  function limparFiltros() {
    setFiltros({ ...FILTRO_INICIAL });
    setFiltrosAtivos({ ...FILTRO_INICIAL });
  }

  const filtrosEmUso = Object.entries(filtrosAtivos).some(([k, v]) => v !== FILTRO_INICIAL[k as keyof typeof FILTRO_INICIAL]);

  const produtosFiltrados = produtos.filter(p => {
    const { codigo, nome, grupoId, subGrupoId, status, dataInicio, dataFim } = filtrosAtivos;
    if (codigo && !p.codigo.toLowerCase().includes(codigo.toLowerCase())) return false;
    if (nome && !p.nome.toLowerCase().includes(nome.toLowerCase())) return false;
    if (grupoId && p.grupo?.id !== grupoId) return false;
    if (subGrupoId && p.subGrupo?.id !== subGrupoId) return false;
    if (status === "ativo" && !p.ativo) return false;
    if (status === "inativo" && p.ativo) return false;
    if (dataInicio && new Date(p.criadoEm) < new Date(dataInicio)) return false;
    if (dataFim && new Date(p.criadoEm) > new Date(dataFim + "T23:59:59")) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-gray-500 text-sm">
            {loading
              ? "Carregando..."
              : filtrosEmUso
              ? `${produtosFiltrados.length} de ${produtos.length} produtos`
              : `${produtos.length} produtos cadastrados`}
          </p>
        </div>
        <Link
          href="/produtos/novo"
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition"
        >
          <Plus size={16} />
          Novo Produto
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <SlidersHorizontal size={15} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtros</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Código</label>
            <input
              type="text"
              value={filtros.codigo}
              onChange={e => setFiltros(f => ({ ...f, codigo: e.target.value }))}
              placeholder="CAV001..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Nome</label>
            <input
              type="text"
              value={filtros.nome}
              onChange={e => setFiltros(f => ({ ...f, nome: e.target.value }))}
              placeholder="Camisa..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Categoria</label>
            <select
              value={filtros.grupoId}
              onChange={e => setFiltros(f => ({ ...f, grupoId: e.target.value, subGrupoId: "" }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
            >
              <option value="">Todas</option>
              {grupos.map(g => <option key={g.id} value={g.id}>{g.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Subcategoria</label>
            <select
              value={filtros.subGrupoId}
              onChange={e => setFiltros(f => ({ ...f, subGrupoId: e.target.value }))}
              disabled={!filtros.grupoId}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white disabled:opacity-50"
            >
              <option value="">Todas</option>
              {subGruposFiltro.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select
              value={filtros.status}
              onChange={e => setFiltros(f => ({ ...f, status: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
            >
              <option value="todos">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Data de cadastro — início</label>
            <input
              type="date"
              value={filtros.dataInicio}
              onChange={e => setFiltros(f => ({ ...f, dataInicio: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Data de cadastro — fim</label>
            <input
              type="date"
              value={filtros.dataFim}
              onChange={e => setFiltros(f => ({ ...f, dataFim: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={aplicarFiltros}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition"
          >
            <Search size={14} />
            Aplicar filtros
          </button>
          {filtrosEmUso && (
            <button
              onClick={limparFiltros}
              className="flex items-center gap-2 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              <X size={14} />
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Código</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Categoria</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Subcategoria</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Varejo</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Atacado</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Fábrica</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {produtosFiltrados.map((p) => (
              <tr key={p.id} className={`hover:bg-gray-50 transition ${!p.ativo ? "opacity-50" : ""}`}>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.codigo}</td>
                <td className="px-4 py-3 font-medium">{p.nome}</td>
                <td className="px-4 py-3 text-gray-500">{p.grupo?.nome ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{p.subGrupo?.nome ?? "—"}</td>
                <td className="px-4 py-3 text-right">{formatarMoeda(Number(p.precoVarejoVista))}</td>
                <td className="px-4 py-3 text-right">{formatarMoeda(Number(p.precoAtacadoVista))}</td>
                <td className="px-4 py-3 text-right">{formatarMoeda(Number(p.precoFabricaVista))}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleAtivo(p.id, p.ativo)}
                    disabled={toggling === p.id}
                    title={p.ativo ? "Clique para desativar" : "Clique para ativar"}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition hover:opacity-80 disabled:opacity-40 ${p.ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                  >
                    <Power size={10} />
                    {p.ativo ? "Ativo" : "Inativo"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/produtos/${p.id}`} className="text-blue-600 hover:underline text-xs">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && produtosFiltrados.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            {filtrosEmUso ? "Nenhum produto encontrado com os filtros aplicados." : "Nenhum produto cadastrado ainda."}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
