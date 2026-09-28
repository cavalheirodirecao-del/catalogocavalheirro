"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
const money = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
export default function AlcancePage() {
  const [data,setData] = useState<any>(null);
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(true);
  const [filters,setFilters] = useState({ dataInicio:"", dataFim:"", catalogo:"", tipo:"" });
  const [copied,setCopied] = useState("");
  async function load(values = filters) {
    setLoading(true); setError("");
    try {
      const query = new URLSearchParams(Object.entries(values).filter(([,v])=>!!v));
      const response = await fetch("/api/admin/alcance?" + query);
      const json = await response.json();
      if (!response.ok) throw new Error(json.erro ?? "Não foi possível carregar os resultados.");
      setData(json);
    } catch(e) { setError(e instanceof Error ? e.message : "Erro de conexão."); }
    finally { setLoading(false); }
  }
  useEffect(()=>{ void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function copy(path: string) {
    try { await navigator.clipboard.writeText(window.location.origin + path); setCopied(path); }
    catch { setError("Não foi possível copiar. Selecione o endereço do link."); }
  }
  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold">{data?.somenteMeus ? "Meus resultados" : "Alcance e vendas"}</h1>
      <p className="text-sm text-gray-500 mt-1">Acompanhe quem chegou pelos links e os pedidos de cada vendedor ou afiliado.</p></div>
    {data?.links?.length > 0 && <section className="bg-white border rounded-xl p-4 space-y-3">
      <h2 className="font-semibold">Meus links para compartilhar</h2>
      {data.links.map((l:any)=><div key={l.catalogo} className="flex gap-3 items-center flex-wrap">
        <span className="text-sm font-medium">{l.catalogo}</span><a className="text-sm underline break-all" href={l.caminho} target="_blank" rel="noreferrer">{typeof window !== "undefined" ? window.location.origin : ""}{l.caminho}</a>
        <button onClick={()=>copy(l.caminho)} className="text-sm border rounded px-3 py-1">{copied===l.caminho ? "Copiado" : "Copiar link"}</button>
      </div>)}
    </section>}
    <form onSubmit={e=>{e.preventDefault(); void load();}} className="bg-white border rounded-xl p-4 flex gap-3 flex-wrap items-end">
      <label className="text-sm">De<input className="block border rounded p-2" type="date" value={filters.dataInicio} onChange={e=>setFilters({...filters,dataInicio:e.target.value})}/></label>
      <label className="text-sm">Até<input className="block border rounded p-2" type="date" value={filters.dataFim} onChange={e=>setFilters({...filters,dataFim:e.target.value})}/></label>
      <label className="text-sm">Catálogo<select className="block border rounded p-2" value={filters.catalogo} onChange={e=>setFilters({...filters,catalogo:e.target.value})}>
        <option value="">Todos</option><option value="VAREJO">Varejo</option><option value="ATACADO">Atacado</option><option value="FABRICA">Grandes clientes</option></select></label>
      {!data?.somenteMeus && <label className="text-sm">Participantes<select className="block border rounded p-2" value={filters.tipo} onChange={e=>setFilters({...filters,tipo:e.target.value})}>
        <option value="">Vendedores e afiliados</option><option value="VENDEDOR">Vendedores</option><option value="AFILIADO">Afiliados</option></select></label>}
      <button disabled={loading} className="bg-black text-white rounded px-4 py-2 disabled:opacity-50">Filtrar</button>
      <button type="button" className="border rounded px-4 py-2" onClick={()=>{const empty={dataInicio:"",dataFim:"",catalogo:"",tipo:""};setFilters(empty);void load(empty);}}>Limpar</button>
    </form>
    {error && <p role="alert" className="text-red-700 bg-red-50 rounded p-3">{error}</p>}
    {loading ? <p role="status">Carregando resultados...</p> : data && !error && <>
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">{[
        ["Visitas", data.totais.totalVisitas], ["Visitantes por navegador", data.totais.visitantesUnicos], ["Pedidos recebidos",data.totais.totalPedidos], ["Compras confirmadas",data.totais.compras], ["Valor das compras",money(data.totais.valorCompras)]
      ].map(([label,value])=><div key={label} className="bg-white border rounded-xl p-4"><p className="text-xs text-gray-500">{label}</p><p className="text-2xl font-bold mt-2">{value}</p></div>)}</div>
      <div className="bg-white border rounded-xl overflow-x-auto"><table className="w-full text-sm whitespace-nowrap"><thead className="bg-gray-50 text-left"><tr>
        {["Vendedor / afiliado","Visitas","Visitantes","Pedidos","Pedidos pelo link","Compras","Compras pelo link","Pendentes","Cancelados","Valor das compras"].map(x=><th key={x} className="p-3">{x}</th>)}
      </tr></thead><tbody>{data.ranking.map((r:any)=><tr key={r.tipo+r.id} className="border-t">
        <td className="p-3"><p className="font-semibold">{r.nome}</p><p className="text-xs text-gray-500">{r.tipo} · {r.slug}</p>{r.pedidosLegados>0 && <p className="text-xs text-gray-500">{r.pedidosLegados} pedidos antigos sem origem identificada</p>}</td>
        <td className="p-3">{r.totalVisitas}</td><td className="p-3">{r.visitantesUnicos}{r.ipsLegados>0 && <p className="text-xs text-gray-500">+ {r.ipsLegados} IPs históricos</p>}</td>
        <td className="p-3">{r.totalPedidos}</td><td className="p-3">{r.pedidosViaLink}</td><td className="p-3 font-semibold">{r.compras}</td><td className="p-3">{r.comprasViaLink}</td><td className="p-3">{r.pendentes}</td><td className="p-3">{r.cancelados}</td><td className="p-3">{money(r.valorCompras)}</td>
      </tr>)}</tbody></table>{data.ranking.length===0 && <p className="p-8 text-center text-gray-500">Nenhum resultado para os filtros selecionados.</p>}</div>
      <div className="text-xs text-gray-500 space-y-2">
        <p>Uma visita por sessão de 30 minutos, catálogo e origem. Visitantes são navegadores identificados por cookie: trocar de aparelho ou apagar cookies pode contar novamente. Dados antigos por IP ficam separados.</p>
        <p>Compras confirmadas incluem confirmado, separando, enviado e concluído. Pendentes e cancelados não entram no valor de compras. O período usa a data de criação do pedido e o horário de Brasília.</p>
        <p>O último link válido fica associado por 7 dias. Compras pelo link são identificadas a partir desta atualização; pedidos antigos não recebem uma origem presumida.</p>
      </div><Link className="inline-block underline text-sm" href="/pedidos">Ver pedidos</Link>
    </>}
  </div>;
}
