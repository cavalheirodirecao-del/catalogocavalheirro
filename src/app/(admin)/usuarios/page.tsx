"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, RotateCcw, UserSquare, ExternalLink } from "lucide-react";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  ativo: boolean;
  criadoEm: string;
  vendedor: { id: string } | null;
}

const PERFIL_COR: Record<string, string> = {
  ADMIN:      "bg-red-100 text-red-700",
  GERENTE:    "bg-blue-100 text-blue-700",
  VENDEDOR:   "bg-green-100 text-green-700",
  ESTOQUISTA: "bg-amber-100 text-amber-700",
};

const PERFIL_LABEL: Record<string, string> = {
  ADMIN:      "Admin",
  GERENTE:    "Gerente",
  VENDEDOR:   "Vendedor",
  ESTOQUISTA: "Estoquista",
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [resetando, setResetando] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  async function carregar() {
    setCarregando(true);
    const res = await fetch("/api/usuarios");
    const data = await res.json();
    setUsuarios(data);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  async function resetarSenha(id: string, nome: string) {
    if (!confirm(`Resetar senha de "${nome}" para 12345678?`)) return;
    setResetando(id);
    const res = await fetch(`/api/usuarios/${id}/reset-senha`, { method: "POST" });
    const data = await res.json();
    setResetando(null);
    if (data.ok) {
      setMsg(`Senha de "${nome}" resetada para 12345678.`);
      setTimeout(() => setMsg(""), 4000);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usuários</h1>
          <p className="text-gray-500 text-sm mt-0.5">Gerencie quem tem acesso ao painel</p>
        </div>
        <Link
          href="/usuarios/novo"
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
        >
          <Plus size={16} />
          Novo Usuário
        </Link>
      </div>

      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
          {msg}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {carregando ? (
          <div className="p-8 text-center text-gray-400 text-sm">Carregando...</div>
        ) : usuarios.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Nenhum usuário encontrado.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Nome</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">E-mail</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Perfil</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium">{u.nome}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PERFIL_COR[u.perfil] ?? "bg-gray-100 text-gray-600"}`}>
                      {PERFIL_LABEL[u.perfil] ?? u.perfil}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {u.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {u.vendedor && (
                        <Link
                          href={`/vendedores/${u.vendedor.id}`}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          <ExternalLink size={12} />
                          Vendedor
                        </Link>
                      )}
                      <button
                        onClick={() => resetarSenha(u.id, u.nome)}
                        disabled={resetando === u.id}
                        className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 disabled:opacity-40 transition"
                        title="Resetar senha para 12345678"
                      >
                        <RotateCcw size={13} className={resetando === u.id ? "animate-spin" : ""} />
                        Reset senha
                      </button>
                      <Link
                        href={`/usuarios/${u.id}`}
                        className="flex items-center gap-1 text-xs text-gray-600 hover:text-black transition"
                      >
                        <UserSquare size={13} />
                        Editar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Vendedores são criados em{" "}
        <Link href="/vendedores/novo" className="underline hover:text-gray-600">
          Vendedores → Novo
        </Link>
        . Afiliados são gerenciados em Afiliados.
      </p>
    </div>
  );
}
