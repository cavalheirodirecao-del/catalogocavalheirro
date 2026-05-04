"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

interface Grade { id: string; nome: string; itens: { id: string; valor: string }[]; }
interface Grupo { id: string; nome: string; subGrupos: { id: string; nome: string }[]; }
interface Imagem { url: string; principal: boolean; }
interface Cor { nome: string; hexCor: string; imagens: Imagem[]; }

export default function NovoProdutoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [subGrupos, setSubGrupos] = useState<{ id: string; nome: string }[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [form, setForm] = useState({
    codigo: "",
    nome: "",
    descricao: "",
    videoUrl: "",
    imagemPrincipal: "",
    tabelaMedidas: "",
    descricaoCompleta: "",
    grupoId: "",
    subGrupoId: "",
    gradeId: "",
    precoVarejoVista: 0,
    precoVarejoPrazo: 0,
    precoAtacadoVista: 0,
    precoAtacadoPrazo: 0,
    precoFabricaVista: 0,
    precoFabricaPrazo: 0,
    novidade: false,
    oferta: false,
    cores: [{ nome: "", hexCor: "#000000", imagens: [{ url: "", principal: true }] }] as Cor[],
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/grupos").then(r => r.json()),
      fetch("/api/grades").then(r => r.json()),
    ]).then(([grps, gds]) => {
      setGrupos(grps);
      setGrades(gds);
    });
  }, []);

  useEffect(() => {
    if (form.grupoId) {
      const grupo = grupos.find(g => g.id === form.grupoId);
      setSubGrupos(grupo?.subGrupos ?? []);
    } else {
      setSubGrupos([]);
    }
  }, [form.grupoId, grupos]);

  function setField(field: string, value: any) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function setCor(idx: number, field: string, value: any) {
    setForm(f => {
      const cores = [...f.cores];
      cores[idx] = { ...cores[idx], [field]: value };
      return { ...f, cores };
    });
  }

  function addImagem(ci: number) {
    setForm(f => {
      const cores = [...f.cores];
      cores[ci].imagens = [...cores[ci].imagens, { url: "", principal: false }];
      return { ...f, cores };
    });
  }

  function setImagem(ci: number, ii: number, url: string) {
    setForm(f => {
      const cores = [...f.cores];
      cores[ci].imagens[ii] = { ...cores[ci].imagens[ii], url };
      return { ...f, cores };
    });
  }

  function removeImagem(ci: number, ii: number) {
    setForm(f => {
      const cores = [...f.cores];
      cores[ci].imagens = cores[ci].imagens.filter((_, i) => i !== ii);
      return { ...f, cores };
    });
  }

  function addCor() {
    setForm(f => ({
      ...f,
      cores: [...f.cores, { nome: "", hexCor: "#000000", imagens: [{ url: "", principal: true }] }],
    }));
  }

  function removeCor(idx: number) {
    setForm(f => ({ ...f, cores: f.cores.filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSaving(true);
    try {
      const res = await fetch("/api/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, cores: form.cores.filter(c => c.nome) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao criar produto");
      router.push("/produtos");
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Novo Produto</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {erro && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{erro}</p>}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">Dados Básicos</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
              <input type="text" required value={form.codigo} onChange={e => setField("codigo", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input type="text" required value={form.nome} onChange={e => setField("nome", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição curta</label>
            <textarea value={form.descricao} onChange={e => setField("descricao", e.target.value)} rows={2}
              placeholder="Ex: 97% Algodão 3% Elastano"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição completa</label>
            <p className="text-xs text-gray-400 mb-1">Composição, materiais, características, observações do modelo etc.</p>
            <textarea value={form.descricaoCompleta} onChange={e => setField("descricaoCompleta", e.target.value)} rows={6}
              placeholder={"Composição: 97% Algodão 3% Elastano\nGramatura: 220g/m²\nEncolhimento aproximado: 2%\n\nObs: Modelo veste tamanho G, altura 1,80m, peso 81kg"}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black font-mono" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ImageUpload label="Foto Principal" aspect="square"
              value={form.imagemPrincipal} onChange={v => setField("imagemPrincipal", v)} />
            <ImageUpload label="Tabela de Medidas" aspect="free"
              value={form.tabelaMedidas} onChange={v => setField("tabelaMedidas", v)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
              <select value={form.grupoId} onChange={e => setField("grupoId", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
                <option value="">— Sem grupo —</option>
                {grupos.map(g => <option key={g.id} value={g.id}>{g.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subgrupo</label>
              <select value={form.subGrupoId} onChange={e => setField("subGrupoId", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
                <option value="">— Sem subgrupo —</option>
                {subGrupos.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grade de Tamanhos</label>
            <select value={form.gradeId} onChange={e => setField("gradeId", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
              <option value="">— Sem grade —</option>
              {grades.map(g => <option key={g.id} value={g.id}>{g.nome}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">Preços</h2>
          {[
            { label: "Varejo", vista: "precoVarejoVista", prazo: "precoVarejoPrazo" },
            { label: "Atacado", vista: "precoAtacadoVista", prazo: "precoAtacadoPrazo" },
            { label: "Fábrica", vista: "precoFabricaVista", prazo: "precoFabricaPrazo" },
          ].map(({ label, vista, prazo }) => (
            <div key={label} className="grid grid-cols-3 gap-3 items-center">
              <span className="text-sm font-medium text-gray-600">{label}</span>
              <div>
                <label className="block text-xs text-gray-400 mb-1">À vista</label>
                <input type="number" step="0.01" min="0" value={(form as any)[vista]}
                  onChange={e => setField(vista, parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">A prazo</label>
                <input type="number" step="0.01" min="0" value={(form as any)[prazo]}
                  onChange={e => setField(prazo, parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-700 mb-1">Categorias Especiais</h2>
          <p className="text-xs text-gray-400 mb-3">O produto aparece em sua categoria principal + nas marcadas abaixo.</p>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.novidade} onChange={e => setField("novidade", e.target.checked)} className="w-4 h-4 accent-black" />
              <span className="text-sm font-medium">Novidades</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.oferta} onChange={e => setField("oferta", e.target.checked)} className="w-4 h-4 accent-black" />
              <span className="text-sm font-medium">Ofertas</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">Cores e Imagens</h2>
            <button type="button" onClick={addCor} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
              <Plus size={14} /> Adicionar cor
            </button>
          </div>
          {form.cores.map((cor, ci) => (
            <div key={ci} className="border border-gray-100 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Nome da cor *</label>
                    <input type="text" value={cor.nome} onChange={e => setCor(ci, "nome", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Cor</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={cor.hexCor} onChange={e => setCor(ci, "hexCor", e.target.value)}
                        className="w-10 h-9 rounded border border-gray-200 cursor-pointer" />
                      <input type="text" value={cor.hexCor} onChange={e => setCor(ci, "hexCor", e.target.value)}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
                    </div>
                  </div>
                </div>
                {form.cores.length > 1 && (
                  <button type="button" onClick={() => removeCor(ci)} className="text-red-400 hover:text-red-600 mt-4">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-xs text-gray-500">Imagens</label>
                <div className="grid grid-cols-3 gap-2">
                  {cor.imagens.map((img, ii) => (
                    <div key={ii} className="relative">
                      <ImageUpload aspect="square" value={img.url} onChange={url => setImagem(ci, ii, url)} />
                      {cor.imagens.length > 1 && (
                        <button type="button" onClick={() => removeImagem(ci, ii)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center z-10">
                          <Trash2 size={10} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addImagem(ci)}
                    className="border-2 border-dashed border-gray-200 rounded-lg h-24 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-600 transition text-xs">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()}
            className="flex-1 border border-gray-200 rounded-lg py-2 text-sm hover:bg-gray-50 transition">
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 bg-black text-white rounded-lg py-2 text-sm hover:bg-gray-800 transition disabled:opacity-50">
            {saving ? "Criando..." : "Criar Produto"}
          </button>
        </div>
      </form>
    </div>
  );
}
