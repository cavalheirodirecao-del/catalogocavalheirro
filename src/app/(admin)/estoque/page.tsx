"use client";

import { useEffect, useState, useMemo } from "react";
import { SlidersHorizontal, X, Search } from "lucide-react";

interface Variante {
  id: string;
  sku: string | null;
  produto: {
    id: string;
    codigo: string;
    nome: string;
    descricao: string | null;
    grupo: { id: string; nome: string } | null;
    subGrupo: { id: string; nome: string } | null;
  };
  cor: { nome: string };
  gradeItem: { valor: string; ordem: number };
  estoque: { quantidade: number; pendente: number } | null;
}

function getDisponivel(v: Variante) {
  return Math.max(0, (v.estoque?.quantidade ?? 0) - (v.estoque?.pendente ?? 0));
}

export default function EstoquePage() {
  const [variantes, setVariantes] = useState<Variante[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ varianteId: string; nome: string } | null>(null);
  const [ajuste, setAjuste] = useState({ tipo: "ENTRADA", quantidade: 1, obs: "" });
  const [saving, setSaving] = useState(false);

  // Filtros
  const [busca, setBusca] = useState("");
  const [filtroGrupo, setFiltroGrupo] = useState("");
  const [filtroSubGrupo, setFiltroSubGrupo] = useState("");
  const [filtroSituacao, setFiltroSituacao] = useState("");

  async function carregar() {
    const res = await fetch("/api/produtos");
    const produtos = await res.json();
    const vars: Variante[] = [];
    for (const p of produtos) {
      for (const cor of p.cores) {
        for (const v of cor.variantes) {
          vars.push({
            id: v.id,
            sku: v.sku,
            produto: {
              id: p.id,
              codigo: p.codigo,
              nome: p.nome,
              descricao: p.descricao,
              grupo: p.grupo ?? null,
              subGrupo: p.subGrupo ?? null,
            },
            cor: { nome: cor.nome },
            gradeItem: v.gradeItem,
            estoque: v.estoque,
          });
        }
      }
    }
    vars.sort((a, b) => a.produto.nome.localeCompare(b.produto.nome));
    setVariantes(vars);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  // Grupos e subgrupos únicos
  const grupos = useMemo(() => {
    const map = new Map<string, string>();
    for (const v of variantes) {
      if (v.produto.grupo) map.set(v.produto.grupo.id, v.produto.grupo.nome);
    }
    return Array.from(map.entries()).map(([id, nome]) => ({ id, nome })).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [variantes]);

  const subGrupos = useMemo(() => {
    const map = new Map<string, string>();
    for (const v of variantes) {
      if (!filtroGrupo || v.produto.grupo?.id === filtroGrupo) {
        if (v.produto.subGrupo) map.set(v.produto.subGrupo.id, v.produto.subGrupo.nome);
      }
    }
    return Array.from(map.entries()).map(([id, nome]) => ({ id, nome })).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [variantes, filtroGrupo]);

  // Aplica filtros (baseados em disponivel)
  const filtradas = useMemo(() => {
    let lista = variantes;

    if (busca.trim()) {
      const t = busca.toLowerCase();
      lista = lista.filter(v =>
        v.produto.nome.toLowerCase().includes(t) ||
        v.produto.codigo.toLowerCase().includes(t) ||
        (v.produto.descricao ?? "").toLowerCase().includes(t) ||
        v.cor.nome.toLowerCase().includes(t)
      );
    }
    if (filtroGrupo) lista = lista.filter(v => v.produto.grupo?.id === filtroGrupo);
    if (filtroSubGrupo) lista = lista.filter(v => v.produto.subGrupo?.id === filtroSubGrupo);
    if (filtroSituacao === "zerado") lista = lista.filter(v => getDisponivel(v) === 0);
    if (filtroSituacao === "baixo") lista = lista.filter(v => { const d = getDisponivel(v); return d > 0 && d <= 5; });
    if (filtroSituacao === "ok") lista = lista.filter(v => getDisponivel(v) > 5);

    return lista;
  }, [variantes, busca, filtroGrupo, filtroSubGrupo, filtroSituacao]);

  // Totais (baseados em disponivel)
  const totalZerado = useMemo(() => variantes.filter(v => getDisponivel(v) === 0).length, [variantes]);
  const totalBaixo = useMemo(() => variantes.filter(v => { const d = getDisponivel(v); return d > 0 && d <= 5; }).length, [variantes]);
  const totalOk = useMemo(() => variantes.filter(v => getDisponivel(v) > 5).length, [variantes]);
  const totalPecas = useMemo(() => variantes.reduce((acc, v) => acc + (v.estoque?.quantidade ?? 0), 0), [variantes]);
  const totalPendente = useMemo(() => variantes.reduce((acc, v) => acc + (v.estoque?.pendente ?? 0), 0), [variantes]);

  const temFiltro = busca || filtroGrupo || filtroSubGrupo || filtroSituacao;

  function limparFiltros() {
    setBusca(""); setFiltroGrupo(""); setFiltroSubGrupo(""); setFiltroSituacao("");
  }

  async function salvarAjuste() {
    if (!modal) return;
    setSaving(true);
    await fetch("/api/estoque", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ varianteId: modal.varianteId, ...ajuste }),
    });
    setSaving(false);
    setModal(null);
    setAjuste({ tipo: "ENTRADA", quantidade: 1, obs: "" });
    carregar();
  }

  const selectCls = "border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white";

  if (loading) return <div className="text-gray-400 p-8">Carregando...</div>;

  return (
    <div className="space-y-5">
      {/* ── Cabeçalho ─────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold">Estoque</h1>
        <p className="text-gray-500 text-sm">
          {filtradas.length} de {variantes.length} variantes
          {!temFiltro && (
            <span className="ml-2 text-gray-700 font-medium">
              · {totalPecas} peças físicas · {totalPendente} pendentes · {totalPecas - totalPendente} disponíveis
            </span>
          )}
        </p>
      </div>

      {/* ── Cards de situação (baseados em disponível) ── */}
      {!temFiltro && (
        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => setFiltroSituacao(filtroSituacao === "zerado" ? "" : "zerado")}
            className={`rounded-xl border p-4 text-left transition ${filtroSituacao === "zerado" ? "border-red-500 bg-red-50" : "bg-white border-gray-100 hover:border-gray-300"}`}>
            <p className="text-2xl font-bold text-red-600">{totalZerado}</p>
            <p className="text-xs text-gray-400 mt-0.5">Zerados (disponível)</p>
          </button>
          <button onClick={() => setFiltroSituacao(filtroSituacao === "baixo" ? "" : "baixo")}
            className={`rounded-xl border p-4 text-left transition ${filtroSituacao === "baixo" ? "border-yellow-500 bg-yellow-50" : "bg-white border-gray-100 hover:border-gray-300"}`}>
            <p className="text-2xl font-bold text-yellow-600">{totalBaixo}</p>
            <p className="text-xs text-gray-400 mt-0.5">Disponível baixo (≤5)</p>
          </button>
          <button onClick={() => setFiltroSituacao(filtroSituacao === "ok" ? "" : "ok")}
            className={`rounded-xl border p-4 text-left transition ${filtroSituacao === "ok" ? "border-green-500 bg-green-50" : "bg-white border-gray-100 hover:border-gray-300"}`}>
            <p className="text-2xl font-bold text-green-600">{totalOk}</p>
            <p className="text-xs text-gray-400 mt-0.5">Em estoque</p>
          </button>
        </div>
      )}

      {/* ── Filtros ───────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por referência, nome, descrição ou cor..."
            className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <select value={filtroGrupo} onChange={e => { setFiltroGrupo(e.target.value); setFiltroSubGrupo(""); }} className={selectCls}>
            <option value="">Todas categorias</option>
            {grupos.map(g => <option key={g.id} value={g.id}>{g.nome}</option>)}
          </select>

          <select value={filtroSubGrupo} onChange={e => setFiltroSubGrupo(e.target.value)} className={selectCls} disabled={subGrupos.length === 0}>
            <option value="">Todas subcategorias</option>
            {subGrupos.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>

          <select value={filtroSituacao} onChange={e => setFiltroSituacao(e.target.value)} className={selectCls}>
            <option value="">Todas situações</option>
            <option value="zerado">Zerado</option>
            <option value="baixo">Baixo (≤5)</option>
            <option value="ok">OK (&gt;5)</option>
          </select>

          {temFiltro && (
            <button onClick={limparFiltros}
              className="inline-flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-black border border-gray-200 rounded-lg px-3 py-2 transition">
              <X size={13} /> Limpar
            </button>
          )}
        </div>
      </div>

      {/* ── Tabela ────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Ref.</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Produto</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Categoria</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Subcategoria</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Cor</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Tamanho</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Estoque</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Pendente</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Disponível</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Situação</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtradas.map((v) => {
                const qtd = v.estoque?.quantidade ?? 0;
                const pendente = v.estoque?.pendente ?? 0;
                const disponivel = getDisponivel(v);
                const situacao = disponivel === 0 ? "Zerado" : disponivel <= 5 ? "Baixo" : "OK";
                const corSit = disponivel === 0
                  ? "bg-red-100 text-red-600"
                  : disponivel <= 5 ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700";

                return (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{v.produto.codigo}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium whitespace-nowrap">{v.produto.nome}</p>
                      {v.produto.descricao && (
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">{v.produto.descricao}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {v.produto.grupo?.nome ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {v.produto.subGrupo?.nome ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{v.cor.nome}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{v.gradeItem.valor}</td>
                    <td className="px-4 py-3 text-center font-bold text-base">{qtd}</td>
                    <td className="px-4 py-3 text-center text-orange-600 font-medium">
                      {pendente > 0 ? pendente : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-base">{disponivel}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${corSit}`}>{situacao}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setModal({ varianteId: v.id, nome: `${v.produto.nome} — ${v.cor.nome} ${v.gradeItem.valor}` })}
                        className="text-gray-400 hover:text-black transition"
                        title="Ajustar estoque"
                      >
                        <SlidersHorizontal size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtradas.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            {temFiltro ? (
              <>
                <p className="font-medium">Nenhuma variante encontrada</p>
                <button onClick={limparFiltros} className="text-sm text-black underline mt-2">Limpar filtros</button>
              </>
            ) : "Nenhuma variante cadastrada."}
          </div>
        )}
      </div>

      {/* ── Modal de ajuste ───────────────────── */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Ajustar Estoque</h2>
              <button onClick={() => setModal(null)}><X size={18} className="text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-500">{modal.nome}</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select value={ajuste.tipo} onChange={e => setAjuste(a => ({ ...a, tipo: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
                <option value="ENTRADA">Entrada</option>
                <option value="SAIDA">Saída</option>
                <option value="AJUSTE">Ajuste (definir quantidade exata)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
              <input type="number" min="1" value={ajuste.quantidade}
                onChange={e => setAjuste(a => ({ ...a, quantidade: Number(e.target.value) }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
              <input type="text" value={ajuste.obs} onChange={e => setAjuste(a => ({ ...a, obs: e.target.value }))}
                placeholder="Ex: Compra NF 1234"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setModal(null)}
                className="flex-1 border border-gray-200 rounded-lg py-2 text-sm hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button onClick={salvarAjuste} disabled={saving}
                className="flex-1 bg-black text-white rounded-lg py-2 text-sm hover:bg-gray-800 transition disabled:opacity-50">
                {saving ? "Salvando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
