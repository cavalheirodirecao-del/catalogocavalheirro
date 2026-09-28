"use client";
import { useEffect, useState } from "react";
type Cliente = { id: string; nome: string; telefone: string; ativo: boolean; expiraEm: string; usadoEm: string | null };
export default function GrandesClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]), [nome, setNome] = useState(""), [telefone, setTelefone] = useState("");
  const [link, setLink] = useState(""), [erro, setErro] = useState(""), [ocupado, setOcupado] = useState(false), [copiado, setCopiado] = useState(false);
  async function carregar() { const r = await fetch("/api/exclusivo/convites"); const d = await r.json(); if (!r.ok) throw new Error(d.erro ?? "Erro ao carregar clientes."); setClientes(d); }
  useEffect(() => { void carregar().catch(e => setErro(e.message)); }, []);
  async function executar(acao: "emitir" | "revogar", id?: string) {
    setOcupado(true); setErro(""); setLink(""); setCopiado(false);
    try {
      const r = await fetch("/api/exclusivo/convites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ acao, id, ...(!id ? { nome, telefone } : {}) }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.erro ?? "Não foi possível atualizar o acesso.");
      if (d.convite) setLink(window.location.origin + d.convite);
      if (!id) { setNome(""); setTelefone(""); }
      await carregar();
    } catch (e) { setErro(e instanceof Error ? e.message : "Erro de conexão."); } finally { setOcupado(false); }
  }
  return <div className="max-w-5xl space-y-6"><h1 className="text-2xl font-bold">Grandes clientes · Convites</h1><p className="text-gray-600">Libere somente clientes aprovados pela equipe. Cada convite vale por 72 horas e pode ser ativado uma vez. O acesso dura 7 dias naquele navegador. Reemitir invalida o convite e o acesso anteriores; revogar bloqueia imediatamente novas consultas e compras.</p><form onSubmit={e => { e.preventDefault(); void executar("emitir"); }} className="bg-white border rounded-xl p-5 flex flex-wrap gap-3"><input required minLength={2} maxLength={160} aria-label="Nome do cliente aprovado" placeholder="Nome do cliente aprovado" value={nome} onChange={e=>setNome(e.target.value)} className="border rounded p-2 flex-1"/><input required aria-label="Telefone do cliente" placeholder="Telefone com DDD" value={telefone} onChange={e=>setTelefone(e.target.value)} className="border rounded p-2"/><button disabled={ocupado} className="bg-black text-white rounded p-3 disabled:opacity-50">Aprovar e gerar convite</button></form>{erro && <p role="alert" className="text-red-700">{erro}</p>}{link && <div className="bg-amber-50 border p-4 rounded-xl space-y-3"><p>Copie e envie diretamente ao cliente. Este link será exibido somente agora. Quem o receber primeiro poderá ativá-lo.</p><input readOnly aria-label="Convite individual" value={link} className="border p-2 w-full"/><button onClick={async()=>{try {await navigator.clipboard.writeText(link);setCopiado(true);}catch{setErro("Selecione e copie o link manualmente.");}}}>{copiado?"Copiado!":"Copiar convite"}</button></div>}<div className="space-y-3">{clientes.map(c=><div key={c.id} className="bg-white border rounded-xl p-4 flex flex-wrap gap-4 items-center"><div className="flex-1"><p className="font-semibold">{c.nome}</p><p className="text-sm text-gray-600">{c.telefone} · {!c.ativo?"Revogado":c.usadoEm?(Date.now()-new Date(c.usadoEm).getTime()>7*86400000?"Acesso expirado":"Convite ativado"):new Date(c.expiraEm)<new Date()?"Convite expirado":"Aguardando ativação"}</p></div><button disabled={ocupado} onClick={()=>executar("emitir",c.id)} className="border rounded p-2">Gerar novo convite</button>{c.ativo && <button disabled={ocupado} onClick={()=>executar("revogar",c.id)} className="text-red-700 border rounded p-2">Revogar acesso</button>}</div>)}</div></div>;
}
