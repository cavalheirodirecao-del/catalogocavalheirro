"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpCircle, ArrowDownCircle, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

interface Movimentacao {
  id: string;
  tipo: "ENTRADA" | "SAIDA" | "AJUSTE";
  quantidade: number;
  obs: string | null;
  fornecedor: string | null;
  numeroDocumento: string | null;
  dataDocumento: string | null;
  criadoEm: string;
  variante: {
    produto: { codigo: string; nome: string };
    cor: { nome: string };
    gradeItem: { valor: string };
  };
  usuario: { nome: string };
}

const TIPO_CONFIG = {
  ENTRADA: { label: "Entrada", icon: ArrowUpCircle, cls: "text-green-600 bg-green-50 border-green-200" },
  SAIDA: { label: "Saída", icon: ArrowDownCircle, cls: "text-red-600 bg-red-50 border-red-200" },
  AJUSTE: { label: "Ajuste", icon: SlidersHorizontal, cls: "text-blue-600 bg-blue-50 border-blue-200" },
};

export default function HistoricoMovimentacoesPage() {
  const [movs, setMovs] = useState<Movimentacao[]>([]);
  const [loading, setLoading] = useState(true);

  const [filtroTipo, setFiltroTipo] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  async function carregar() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filtroTipo) params.set("tipo", filtroTipo);
    if (dataInicio) params.set("dataInicio", dataInicio);
    if (dataFim) params.set("dataFim", dataFim);
    try {
      const res = await fetch(`/api/estoque/movimentacoes?${params}`);
      const data = await res.json();
      setMovs(data);
    } catch { setMovs([]); }
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  const selectCls = "border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Histórico de Movimentações</h1>
          <p className="text-gray-500 text-sm">{movs.length} registros</p>
        </div>
        <Link href="/estoque/movimentacao/nova"
          className="flex items-center gap-2 bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition">
          + Nova movimentação
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Tipo</label>
          <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className={selectCls}>
            <option value="">Todos</option>
            <option value="ENTRADA">Entrada</option>
            <option value="SAIDA">Saída</option>
            <option value="AJUSTE">Ajuste</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Data início</label>
          <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className={selectCls} />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Data fim</label>
          <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className={selectCls} />
        </div>
        <button onClick={carregar}
          className="bg-black text-white rounded-lg px-4 py-2 text-sm hover:bg-gray-800 transition">
          Filtrar
        </button>
        {(filtroTipo || dataInicio || dataFim) && (
          <button onClick={() => { setFiltroTipo(""); setDataInicio(""); setDataFim(""); setTimeout(carregar, 50); }}
            className="text-sm text-gray-500 hover:text-black transition">
            Limpar
          </button>
        )}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Carregando…</div>
        ) : movs.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">Nenhuma movimentação encontrada.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Data</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Produto</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Cor / Tam.</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Qtd.</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Fornecedor</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Documento</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Obs.</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Usuário</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {movs.map(m => {
                  const cfg = TIPO_CONFIG[m.tipo];
                  const Icon = cfg.icon;
                  return (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(m.criadoEm), { addSuffix: true, locale: ptBR })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.cls}`}>
                          <Icon size={10} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium whitespace-nowrap">{m.variante.produto.nome}</p>
                        <p className="text-xs text-gray-400 font-mono">{m.variante.produto.codigo}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {m.variante.cor.nome} · {m.variante.gradeItem.valor}
                      </td>
                      <td className="px-4 py-3 text-center font-bold">{m.quantidade}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{m.fornecedor ?? <span className="text-gray-300">—</span>}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                        {m.numeroDocumento ?? <span className="text-gray-300">—</span>}
                        {m.dataDocumento && (
                          <p className="text-gray-300">{new Date(m.dataDocumento).toLocaleDateString("pt-BR")}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[180px]">
                        <p className="truncate text-xs">{m.obs ?? <span className="text-gray-300">—</span>}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{m.usuario.nome}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
