"use client";

import { useState } from "react";
import { KeyRound, CheckCircle2 } from "lucide-react";

export default function MinhaSenhaPage() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso(false);

    if (novaSenha !== confirmar) {
      setErro("A nova senha e a confirmação não coincidem.");
      return;
    }
    if (novaSenha.length < 6) {
      setErro("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setSalvando(true);

    const res = await fetch("/api/minha-senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senhaAtual, novaSenha }),
    });

    const data = await res.json();
    setSalvando(false);

    if (!res.ok) {
      setErro(data.erro ?? "Erro ao alterar senha.");
      return;
    }

    setSucesso(true);
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmar("");
  }

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black";
  const labelCls = "text-xs text-gray-500 block mb-1";

  return (
    <div className="p-6 max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Minha Senha</h1>
        <p className="text-gray-500 text-sm mt-0.5">Altere a sua senha de acesso ao painel</p>
      </div>

      {sucesso && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
          <CheckCircle2 size={16} />
          Senha alterada com sucesso!
        </div>
      )}

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3 pb-2 border-b border-gray-50">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <KeyRound size={15} className="text-white" />
          </div>
          <p className="text-sm font-medium">Alterar senha</p>
        </div>

        <div>
          <label className={labelCls}>Senha atual *</label>
          <input
            required
            type="password"
            value={senhaAtual}
            onChange={e => setSenhaAtual(e.target.value)}
            className={inputCls}
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className={labelCls}>Nova senha *</label>
          <input
            required
            type="password"
            value={novaSenha}
            onChange={e => setNovaSenha(e.target.value)}
            className={inputCls}
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div>
          <label className={labelCls}>Confirmar nova senha *</label>
          <input
            required
            type="password"
            value={confirmar}
            onChange={e => setConfirmar(e.target.value)}
            className={inputCls}
            placeholder="Repita a nova senha"
          />
        </div>

        <button
          type="submit"
          disabled={salvando}
          className="w-full bg-black text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 transition disabled:opacity-40"
        >
          {salvando ? "Salvando..." : "Alterar Senha"}
        </button>
      </form>
    </div>
  );
}
