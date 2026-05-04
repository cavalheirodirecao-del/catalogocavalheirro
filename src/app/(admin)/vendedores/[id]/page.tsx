"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditarVendedorPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [lojas, setLojas] = useState<any[]>([]);
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/vendedores/${id}`).then(r => r.json()),
      fetch("/api/lojas").then(r => r.json()),
    ]).then(([v, ls]) => {
      setForm({
        nome: v.usuario.nome,
        email: v.usuario.email,
        telefone: v.telefone ?? "",
        slug: v.slug,
        lojaId: v.lojaId ?? "",
        ativo: v.ativo,
        catalogos: v.links.filter((l: any) => l.ativo).map((l: any) => l.catalogo),
      });
      setLojas(ls);
    }).finally(() => setLoading(false));
  }, [id]);

  function toggleCatalogo(c: string) {
    setForm((f: any) => ({
      ...f,
      catalogos: f.catalogos.includes(c)
        ? f.catalogos.filter((x: string) => x !== c)
        : [...f.catalogos, c],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSaving(true);
    try {
      const res = await fetch(`/api/vendedores/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/vendedores");
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-gray-400 p-8">Carregando...</div>;
  if (!form) return <div className="text-red-500 p-8">Vendedor não encontrado.</div>;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Editar Vendedor</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        {erro && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{erro}</p>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
          <input type="text" required value={form.nome} onChange={e => setForm((f: any) => ({ ...f, nome: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" required value={form.email} onChange={e => setForm((f: any) => ({ ...f, email: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
          <input type="text" value={form.telefone} onChange={e => setForm((f: any) => ({ ...f, telefone: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
          <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-black">
            <span className="text-gray-400 mr-1">/</span>
            <input type="text" required value={form.slug} onChange={e => setForm((f: any) => ({ ...f, slug: e.target.value }))}
              className="flex-1 focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Loja</label>
          <select value={form.lojaId} onChange={e => setForm((f: any) => ({ ...f, lojaId: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
            <option value="">— Sem loja —</option>
            {lojas.map((l: any) => <option key={l.id} value={l.id}>{l.nome} — {l.cidade}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Catálogos ativos</label>
          <div className="flex gap-3">
            {["VAREJO", "ATACADO", "FABRICA"].map(c => (
              <button key={c} type="button" onClick={() => toggleCatalogo(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                  form.catalogos.includes(c) ? "bg-black text-white border-black" : "bg-white text-gray-500 border-gray-200"
                }`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="ativo" checked={form.ativo} onChange={e => setForm((f: any) => ({ ...f, ativo: e.target.checked }))} />
          <label htmlFor="ativo" className="text-sm text-gray-700">Vendedor ativo</label>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()}
            className="flex-1 border border-gray-200 rounded-lg py-2 text-sm hover:bg-gray-50 transition">
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 bg-black text-white rounded-lg py-2 text-sm hover:bg-gray-800 transition disabled:opacity-50">
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
