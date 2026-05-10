"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const PERFIS = [
  { valor: "ADMIN",      label: "Admin — acesso total ao painel" },
  { valor: "GERENTE",    label: "Gerente — acesso total ao painel" },
  { valor: "ESTOQUISTA", label: "Estoquista — acesso total ao painel" },
];

export default function NovoUsuarioPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("12345678");
  const [perfil, setPerfil] = useState("GERENTE");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro("");

    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha, perfil }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro ?? "Erro ao criar usuário.");
        return;
      }

      router.push("/usuarios");
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black";
  const labelCls = "text-xs text-gray-500 block mb-1";

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/usuarios" className="text-gray-400 hover:text-black transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Novo Usuário</h1>
          <p className="text-gray-500 text-sm">Para criar vendedores, use a seção Vendedores.</p>
        </div>
      </div>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div>
          <label className={labelCls}>Nome completo *</label>
          <input required value={nome} onChange={e => setNome(e.target.value)} className={inputCls} placeholder="Maria Silva" />
        </div>

        <div>
          <label className={labelCls}>E-mail *</label>
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="maria@email.com" />
        </div>

        <div>
          <label className={labelCls}>Senha inicial *</label>
          <input required type="password" value={senha} onChange={e => setSenha(e.target.value)} className={inputCls} />
          <p className="text-xs text-gray-400 mt-1">O usuário poderá alterar em "Minha Senha" após o login.</p>
        </div>

        <div>
          <label className={labelCls}>Perfil de acesso *</label>
          <select required value={perfil} onChange={e => setPerfil(e.target.value)} className={inputCls}>
            {PERFIS.map(p => (
              <option key={p.valor} value={p.valor}>{p.label}</option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Vendedores têm acesso restrito apenas a Pedidos — crie-os em <Link href="/vendedores/novo" className="underline">Vendedores → Novo</Link>.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={salvando}
            className="flex-1 bg-black text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 transition disabled:opacity-40"
          >
            {salvando ? "Criando..." : "Criar Usuário"}
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
