"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Search, X, Truck } from "lucide-react";

const corStatus: Record<string, string> = {
  PENDENTE:   "bg-yellow-100 text-yellow-700",
  CONFIRMADO: "bg-blue-100 text-blue-700",
  SEPARANDO:  "bg-purple-100 text-purple-700",
  ENVIADO:    "bg-indigo-100 text-indigo-700",
  CONCLUIDO:  "bg-green-100 text-green-700",
  CANCELADO:  "bg-red-100 text-red-600",
};

const labelCatalogo: Record<string, string> = {
  VAREJO: "Varejo", ATACADO: "Atacado", FABRICA: "Fábrica",
};

const labelEnvio: Record<string, string> = {
  RETIRADA_LOJA: "Retirada", CORREIOS: "Correios", EXCURSAO: "Excursão",
};

function formatMoeda(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function formatData(d: string) {
  return new Date(d).toLocaleDateString("pt-BR");
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroCatalogo, setFiltroCatalogo] = useState("");
  const [filtroPagamento, setFiltroPagamento] = useState("");
  const [filtroEnvio, setFiltroEnvio] = useState("");
  const [filtroVendedor, setFiltroVendedor] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  useEffect(() => {
    fetch("/api/pedidos")
      .then(r => r.json())
      .then(data => { setPedidos(data); setLoading(false); });
  }, []);

  // Vendedores únicos
  const vendedores = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of pedidos) {
      if (p.vendedor) map.set(p.vendedor.id, p.vendedor.usuario.nome);
    }
    return Array.from(map.entries()).map(([id, nome]) => ({ id, nome })).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [pedidos]);

  // Filtros aplicados
  const filtrados = useMemo(() => {
    let lista = pedidos;

    if (busca.trim()) {
      const t = busca.toLowerCase();
      lista = lista.filter(p => {
        const cliente = (p.cliente?.nome ?? p.nomeClienteAvulso ?? "").toLowerCase();
        const num = String(p.numero);
        return cliente.includes(t) || num.includes(t);
      });
    }
    if (filtroStatus) lista = lista.filter(p => p.status === filtroStatus);
    if (filtroCatalogo) lista = lista.filter(p => p.catalogo === filtroCatalogo);
    if (filtroPagamento) lista = lista.filter(p => p.formaPagamento === filtroPagamento);
    if (filtroEnvio) lista = lista.filter(p => p.tipoEnvio === filtroEnvio);
    if (filtroVendedor) lista = lista.filter(p => p.vendedor?.id === filtroVendedor);
    if (dataInicio) lista = lista.filter(p => new Date(p.criadoEm) >= new Date(dataInicio));
    if (dataFim) lista = lista.filter(p => new Date(p.criadoEm) <= new Date(dataFim + "T23:59:59"));

    return lista;
  }, [pedidos, busca, filtroStatus, filtroCatalogo, filtroPagamento, filtroEnvio, filtroVendedor, dataInicio, dataFim]);

  const totalFiltrado = filtrados.reduce((acc, p) => acc + Number(p.total), 0);

  const temFiltro = busca || filtroStatus || filtroCatalogo || filtroPagamento || filtroEnvio || filtroVendedor || dataInicio || dataFim;

  function limparFiltros() {
    setBusca(""); setFiltroStatus(""); setFiltroCatalogo("");
    setFiltroPagamento(""); setFiltroEnvio(""); setFiltroVendedor("");
    setDataInicio(""); setDataFim("");
  }

  const selectCls = "border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white";

  return (
    <div className="space-y-5">
      {/* ── Cabeçalho ─────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <p className="text-gray-500 text-sm">
            {loading ? "Carregando..." : `${filtrados.length} de ${pedidos.length} pedidos`}
            {filtrados.length > 0 && !loading && (
              <span className="ml-2 font-medium text-gray-700">· Total: {formatMoeda(totalFiltrado)}</span>
            )}
          </p>
        </div>
      </div>

      {/* ── Filtros ───────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        {/* Busca */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por cliente ou nº do pedido..."
            className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Filtros em grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
          <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} className={selectCls}>
            <option value="">Todos os status</option>
            {["PENDENTE","CONFIRMADO","SEPARANDO","ENVIADO","CONCLUIDO","CANCELADO"].map(s => (
              <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
            ))}
          </select>

          <select value={filtroCatalogo} onChange={e => setFiltroCatalogo(e.target.value)} className={selectCls}>
            <option value="">Todos catálogos</option>
            <option value="VAREJO">Varejo</option>
            <option value="ATACADO">Atacado</option>
            <option value="FABRICA">Fábrica</option>
          </select>

          <select value={filtroPagamento} onChange={e => setFiltroPagamento(e.target.value)} className={selectCls}>
            <option value="">Todos pagamentos</option>
            <option value="VISTA">À vista</option>
            <option value="PRAZO">A prazo</option>
          </select>

          <select value={filtroEnvio} onChange={e => setFiltroEnvio(e.target.value)} className={selectCls}>
            <option value="">Todos envios</option>
            <option value="RETIRADA_LOJA">Retirada na loja</option>
            <option value="CORREIOS">Correios</option>
            <option value="EXCURSAO">Excursão</option>
          </select>

          <select value={filtroVendedor} onChange={e => setFiltroVendedor(e.target.value)} className={selectCls}>
            <option value="">Todos vendedores</option>
            {vendedores.map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
          </select>

          <input
            type="date"
            value={dataInicio}
            onChange={e => setDataInicio(e.target.value)}
            className={selectCls}
            title="Data início"
          />

          <input
            type="date"
            value={dataFim}
            onChange={e => setDataFim(e.target.value)}
            className={selectCls}
            title="Data fim"
          />
        </div>

        {temFiltro && (
          <button onClick={limparFiltros}
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-black transition">
            <X size={12} /> Limpar filtros
          </button>
        )}
      </div>

      {/* ── Cards de resumo ───────────────────────── */}
      {!loading && !temFiltro && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {["PENDENTE","CONFIRMADO","SEPARANDO","ENVIADO","CONCLUIDO","CANCELADO"].map(s => {
            const qtd = pedidos.filter(p => p.status === s).length;
            return (
              <button key={s} onClick={() => setFiltroStatus(filtroStatus === s ? "" : s)}
                className={`rounded-xl border p-3 text-left transition cursor-pointer ${filtroStatus === s ? "border-black bg-black text-white" : "bg-white border-gray-100 hover:border-gray-300"}`}>
                <p className={`text-2xl font-bold ${filtroStatus === s ? "text-white" : ""}`}>{qtd}</p>
                <p className={`text-xs mt-0.5 ${filtroStatus === s ? "text-white/70" : "text-gray-400"}`}>{s.charAt(0) + s.slice(1).toLowerCase()}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Tabela ────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Carregando pedidos...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">#</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Cliente</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Catálogo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Vendedor</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Envio</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Pagamento</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Total</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 whitespace-nowrap">Data</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtrados.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono text-xs font-bold whitespace-nowrap">#{pedido.numero}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-medium">{pedido.cliente?.nome ?? pedido.nomeClienteAvulso ?? "—"}</p>
                      {(pedido.cliente?.telefone ?? pedido.telefoneClienteAvulso) && (
                        <p className="text-xs text-gray-400">{pedido.cliente?.telefone ?? pedido.telefoneClienteAvulso}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {labelCatalogo[pedido.catalogo] ?? pedido.catalogo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {pedido.vendedor?.usuario.nome ?? "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {pedido.tipoEnvio === "EXCURSAO" ? (
                        <span className="flex items-center gap-1.5 text-xs"
                          title={pedido.excursao ? pedido.excursao.nome : "Excursão não vinculada"}>
                          <Truck size={14} className={pedido.excursao ? "text-green-500" : "text-gray-300"} />
                          <span className={pedido.excursao ? "text-gray-700" : "text-gray-400"}>
                            {pedido.excursao ? pedido.excursao.nome : "Excursão"}
                          </span>
                        </span>
                      ) : (
                        <span className="text-gray-600 text-xs">
                          {labelEnvio[pedido.tipoEnvio] ?? pedido.tipoEnvio}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {pedido.formaPagamento === "VISTA" ? "À vista" : "A prazo"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                      {formatMoeda(Number(pedido.total))}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${corStatus[pedido.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {pedido.status.charAt(0) + pedido.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {formatData(pedido.criadoEm)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/pedidos/${pedido.id}`}
                        className="text-xs bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition whitespace-nowrap">
                        Ver pedido
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtrados.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="font-medium">Nenhum pedido encontrado</p>
                {temFiltro && (
                  <button onClick={limparFiltros} className="text-sm text-black underline mt-2">Limpar filtros</button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
