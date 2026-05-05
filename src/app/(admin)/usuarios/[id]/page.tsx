"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const PERFIS = [
  { valor: "ADMIN",      label: "Admin" },
  { valor: "GERENTE",    label: "Gerente" },
  { valor: "VENDEDOR",   label: "Vendedor" },
  { valor: "ESTOQUISTA", label: "Estoquista" },
];

export default function EditarUsuarioPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [perfil, setPerfil] = useState("GERENTE");
  const [ativo, setAtivo] = useState(true);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetch(`/api/usuarios/${id}`)
      .then(r => r.json())
      .then(data => {
        setNome(data.nome ?? "");
        setEmail(data.email ?? "");
        setPerfil(data.perfil ?? "GERENTE");
        setAtivo(data.ativo ?? true);
        setCarregando(false);
      });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro("");

    const res = await fetch(`/api/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, perfil, ativo }),
    });

    const data = await res.json();
    setSalvando(false);

    if (!res.ok) {
      setErro(data.erro ?? "Erro ao salvar.");
      return;
    }

    router.push("/usuarios");
  }

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black";
  const labelCls = "text-xs text-gray-500 block mb-1";

  if (carregando) return <div className="p-6 text-gray-400 text-sm">Carregando...</div>;

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/usuarios" className="text-gray-400 hover:text-black transition">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Editar Usuário</h1>
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div>
          <label className={labelCls}>Nome completo *</label>
          <input required value={nome} onChange={e => setNome(e.target.value)} className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>E-mail *</label>
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Perfil de acesso *</label>
          <select required value={perfil} onChange={e => setPerfil(e.target.value)} className={inputCls}>
            {PERFIS.map(p => (
              <option key={p.valor} value={p.valor}>{p.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="ativo"
            checked={ativo}
            onChange={e => setAtivo(e.target.checked)}
            className="w-4 h-4 accent-black"
          />
          <label htmlFor="ativo" className="text-sm text-gray-700">Usuário ativo</label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={salvando}
            className="flex-1 bg-black text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 transition disabled:opacity-40"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
          <Link
            href="/usuarios"
            className="px-4 py-2.5 text-sm text-gray-500 hover:text-black transition rounded-lg border border-gray-200"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
