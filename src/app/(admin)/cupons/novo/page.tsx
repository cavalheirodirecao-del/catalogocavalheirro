"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NovoCupomPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({
    codigo: "", tipo: "PERCENTUAL", valor: "", validade: "", usoMaximo: "",
  });

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSaving(true);
    try {
      const res = await fetch("/api/cupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: form.codigo,
          tipo: form.tipo,
          valor: form.valor !== "" ? Number(form.valor) : null,
          validade: form.validade || null,
          usoMaximo: form.usoMaximo !== "" ? Number(form.usoMaximo) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao criar cupom");
      router.push("/cupons");
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Novo Cupom</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        {erro && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{erro}</p>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
          <input type="text" required value={form.codigo} onChange={e => set("codigo", e.target.value.toUpperCase())}
            placeholder="EX: DESCONTO10"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-black" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
          <select value={form.tipo} onChange={e => set("tipo", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
            <option value="PERCENTUAL">Percentual (%)</option>
            <option value="VALOR_FIXO">Valor fixo (R$)</option>
            <option value="FRETE_GRATIS">Frete grátis</option>
          </select>
        </div>

        {form.tipo !== "FRETE_GRATIS" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor {form.tipo === "PERCENTUAL" ? "(%)" : "(R$)"}
            </label>
            <input type="number" step="0.01" min="0" value={form.valor} onChange={e => set("valor", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Validade</label>
          <input type="date" value={form.validade} onChange={e => set("validade", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Limite de usos</label>
          <input type="number" min="1" value={form.usoMaximo} onChange={e => set("usoMaximo", e.target.value)}
            placeholder="Vazio = ilimitado"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()}
            className="flex-1 border border-gray-200 rounded-lg py-2 text-sm hover:bg-gray-50 transition">
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 bg-black text-white rounded-lg py-2 text-sm hover:bg-gray-800 transition disabled:opacity-50">
            {saving ? "Salvando..." : "Criar Cupom"}
          </button>
        </div>
      </form>
    </div>
  );
}
