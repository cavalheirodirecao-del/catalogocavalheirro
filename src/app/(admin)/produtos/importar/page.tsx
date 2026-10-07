"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, FileUp, AlertTriangle, Upload, ShieldCheck } from "lucide-react";

type Grupo = { id: string; nome: string; subGrupos: { id: string; nome: string }[] };
type Resultado = {
  linhas: number; produtos: number; novos: number; existentes: number;
  erros: string[];
  amostra: { codigo: string; nome: string; variacoes: number; situacao: "CRIAR" | "ATUALIZAR"; grupoId: string; subGrupoId: string | null; precoVarejo: number; precoAtacado: number }[];
  ok?: boolean; erro?: string;
};

export default function ImportarProdutosPage() {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoId, setGrupoId] = useState("");
  const [subGrupoId, setSubGrupoId] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [liberado, setLiberado] = useState(false);
  const [edicoes, setEdicoes] = useState<Record<string, { grupoId: string; subGrupoId: string; precoVarejo: number; precoAtacado: number }>>({});

  useEffect(() => {
    fetch("/api/grupos?admin=1").then(r => r.json()).then(setGrupos);
  }, []);

  async function enviar(acao: "validar" | "liberar") {
    if (!arquivo || !grupoId) return;
    setCarregando(true);
    const dados = new FormData();
    dados.append("arquivo", arquivo);
    dados.append("grupoId", grupoId);
    dados.append("subGrupoId", subGrupoId);
    dados.append("acao", acao);
    if (acao === "liberar") dados.append("ajustes", JSON.stringify(edicoes));
    const resposta = await fetch("/api/importacoes/faz-agilizar", { method: "POST", body: dados });
    const json = await resposta.json();
    setResultado(json);
    if (acao === "validar" && json.amostra) setEdicoes(Object.fromEntries(json.amostra.map((p: Resultado["amostra"][number]) => [p.codigo, { grupoId: p.grupoId, subGrupoId: p.subGrupoId ?? "", precoVarejo: p.precoVarejo, precoAtacado: p.precoAtacado }])));
    if (resposta.ok && acao === "liberar") setLiberado(true);
    setCarregando(false);
  }

  const pronto = Boolean(resultado && resultado.erros.length === 0 && !liberado);

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Importar produtos</h1>
        <p className="text-gray-500 text-sm mt-1">Importe o relatório CSV do Faz Agilizar com validação antes de alterar o catálogo.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {[
          ["1", "Enviar arquivo", "Selecione o CSV exportado do Faz Agilizar."],
          ["2", "Validar", "Revise produtos, variações e bloqueios."],
          ["3", "Liberar", "Confirme para sincronizar o estoque."],
        ].map(([numero, titulo, texto]) => <div key={numero} className="bg-white border border-gray-200 rounded-lg p-4 flex gap-3">
          <span className="w-7 h-7 shrink-0 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">{numero}</span>
          <div><p className="text-sm font-semibold">{titulo}</p><p className="text-xs text-gray-500 mt-1">{texto}</p></div>
        </div>)}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-5">
        <div className="grid md:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Arquivo CSV</span>
            <input type="file" accept=".csv,text/csv" onChange={e => { setArquivo(e.target.files?.[0] ?? null); setResultado(null); setLiberado(false); }} className="mt-2 block w-full text-sm file:mr-3 file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:rounded-md file:text-sm file:font-medium hover:file:bg-gray-200" />
            {arquivo && <p className="mt-2 text-xs text-gray-500">{arquivo.name} ({Math.ceil(arquivo.size / 1024)} KB)</p>}
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Categoria para produtos novos</span>
            <select value={grupoId} onChange={e => { setGrupoId(e.target.value); setResultado(null); setLiberado(false); }} className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
              <option value="">Selecione uma categoria</option>
              {grupos.map(g => <option key={g.id} value={g.id}>{g.nome}</option>)}
            </select>
            <p className="mt-2 text-xs text-gray-500">Produtos já cadastrados mantêm sua categoria atual.</p>
          </label>
          <label className="block"><span className="text-sm font-medium text-gray-700">Subcategoria</span><select value={subGrupoId} onChange={e => { setSubGrupoId(e.target.value); setResultado(null); setLiberado(false); }} disabled={!grupoId} className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white disabled:opacity-40"><option value="">Nenhuma</option>{(grupos.find(g => g.id === grupoId)?.subGrupos ?? []).map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}</select><p className="mt-2 text-xs text-gray-500">Aplicada aos produtos novos.</p></label>
        </div>
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex gap-2 text-sm text-amber-800">
          <AlertTriangle size={17} className="shrink-0 mt-0.5" />
          O estoque do arquivo substituirá o estoque atual de cada variação identificada. A alteração ficará registrada no histórico como ajuste de importação.
        </div>
        <button onClick={() => enviar("validar")} disabled={!arquivo || !grupoId || carregando} className="inline-flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-800">
          <FileUp size={16} /> {carregando ? "Validando..." : "Validar arquivo"}
        </button>
      </div>

      {resultado && <div className="space-y-4">
        {liberado && <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex gap-3"><CheckCircle2 size={20} /><div><p className="font-semibold text-sm">Importação concluída</p><p className="text-sm mt-1">{resultado.produtos} produtos e {resultado.linhas} variações foram sincronizados.</p></div></div>}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[ ["Linhas válidas", resultado.linhas], ["Produtos", resultado.produtos], ["Novos", resultado.novos], ["Atualizações", resultado.existentes] ].map(([label, valor]) => <div key={String(label)}><p className="text-xs text-gray-500">{label}</p><p className="text-2xl font-bold mt-1">{valor}</p></div>)}
          </div>
        </div>
        {resultado.erros.length > 0 ? <div className="bg-red-50 border border-red-200 rounded-lg p-5"><p className="font-semibold text-red-800 text-sm">Importação bloqueada: {resultado.erros.length} problema(s)</p><ul className="mt-3 text-sm text-red-700 space-y-1 max-h-52 overflow-auto">{resultado.erros.slice(0, 100).map((erro, i) => <li key={i}>{erro}</li>)}</ul></div> : <div className="bg-white border border-gray-200 rounded-lg overflow-hidden"><div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2"><ShieldCheck size={18} className="text-green-600" /><div><p className="font-semibold text-sm">Validação concluída</p><p className="text-xs text-gray-500">Edite preços e categorias diretamente na tabela antes de liberar.</p></div></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 text-gray-500"><tr><th className="text-left px-4 py-3">Referência / Produto</th><th className="text-center px-4 py-3">Variações</th><th className="text-right px-4 py-3">Varejo</th><th className="text-right px-4 py-3">Atacado</th><th className="text-left px-4 py-3">Grupo</th><th className="text-left px-4 py-3">Subgrupo</th></tr></thead><tbody className="divide-y divide-gray-100">{resultado.amostra.map(item => { const e = edicoes[item.codigo] ?? { grupoId: item.grupoId, subGrupoId: item.subGrupoId ?? "", precoVarejo: item.precoVarejo, precoAtacado: item.precoAtacado }; const subs = grupos.find(g => g.id === e.grupoId)?.subGrupos ?? []; return <tr key={item.codigo}><td className="px-4 py-2 min-w-64"><div className="font-mono text-xs">{item.codigo}</div><div>{item.nome}</div><span className={`text-xs ${item.situacao === "CRIAR" ? "text-blue-700" : "text-amber-700"}`}>{item.situacao === "CRIAR" ? "Criar" : "Atualizar"}</span></td><td className="px-4 py-2 text-center">{item.variacoes}</td><td className="px-4 py-2"><input type="number" step="0.01" value={e.precoVarejo} onChange={ev => setEdicoes(x => ({ ...x, [item.codigo]: { ...e, precoVarejo: Number(ev.target.value) } }))} className="w-24 border rounded px-2 py-1 text-right" /></td><td className="px-4 py-2"><input type="number" step="0.01" value={e.precoAtacado} onChange={ev => setEdicoes(x => ({ ...x, [item.codigo]: { ...e, precoAtacado: Number(ev.target.value) } }))} className="w-24 border rounded px-2 py-1 text-right" /></td><td className="px-4 py-2"><select value={e.grupoId} onChange={ev => setEdicoes(x => ({ ...x, [item.codigo]: { ...e, grupoId: ev.target.value, subGrupoId: "" } }))} className="w-40 border rounded px-2 py-1"><option value="">Selecione</option>{grupos.map(g => <option key={g.id} value={g.id}>{g.nome}</option>)}</select></td><td className="px-4 py-2"><select value={e.subGrupoId} onChange={ev => setEdicoes(x => ({ ...x, [item.codigo]: { ...e, subGrupoId: ev.target.value } }))} className="w-40 border rounded px-2 py-1" disabled={!e.grupoId}><option value="">Nenhum</option>{subs.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}</select></td></tr>; })}</tbody></table></div>{pronto && <div className="p-4 border-t border-gray-100 flex justify-end"><button onClick={() => enviar("liberar")} disabled={carregando} className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"><Upload size={16} /> {carregando ? "Importando..." : "Liberar importação"}</button></div>}</div>}
      </div>}
    </div>
  );
}
