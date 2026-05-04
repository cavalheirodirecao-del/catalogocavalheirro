"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus, Loader2, Eye, EyeOff } from "lucide-react";

const ESTADOS_BR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export default function NovoAfiliadoPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [tipo, setTipo] = useState<"VAREJO" | "ATACADO">("VAREJO");
  const [telefone, setTelefone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [seguidores, setSeguidores] = useState("");
  const [nicho, setNicho] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || !email || !senha) {
      setErro("Nome, e-mail e senha são obrigatórios.");
      return;
    }
    setSalvando(true);
    setErro("");

    const res = await fetch("/api/afiliados", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome, email, senha, tipo,
        telefone, instagram, seguidores, nicho,
        cidade, estado,
        adminCreate: true, // já aprovado e ativo
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setErro(data.erro ?? "Erro ao cadastrar.");
      setSalvando(false);
      return;
    }

    router.push("/afiliados/lista");
  }

  const campo = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-gray-400";
  const label = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1";

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/afiliados/lista" className="p-1.5 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <UserPlus size={20} />
            Cadastrar afiliado
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Afiliado criado pelo admin entra como <strong>Aprovado</strong> e pode logar imediatamente.
          </p>
        </div>
      </div>

      <form onSubmit={salvar} className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">

        {/* Acesso */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dados de acesso</p>

          <div>
            <label className={label}>Nome completo *</label>
            <input value={nome} onChange={e => setNome(e.target.value)} className={campo} placeholder="João Silva" required />
          </div>

          <div>
            <label className={label}>E-mail *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={campo} placeholder="joao@email.com" required />
          </div>

          <div>
            <label className={label}>Senha *</label>
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={e => setSenha(e.target.value)}
                className={`${campo} pr-10`}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                {mostrarSenha ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Anote a senha — você poderá alterá-la depois na tela do afiliado.</p>
          </div>
        </div>

        {/* Programa */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Programa</p>

          <div className="grid grid-cols-2 gap-3">
            {(["VAREJO", "ATACADO"] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                className={`border rounded-lg px-4 py-3 text-sm font-medium transition ${
                  tipo === t
                    ? t === "ATACADO"
                      ? "border-amber-400 bg-amber-50 text-amber-800"
                      : "border-blue-400 bg-blue-50 text-blue-800"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {t === "VAREJO" ? "👕 Varejo" : "🔥 Atacado"}
              </button>
            ))}
          </div>
        </div>

        {/* Perfil */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Perfil (opcional)</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Telefone / WhatsApp</label>
              <input value={telefone} onChange={e => setTelefone(e.target.value)} className={campo} placeholder="81999999999" />
            </div>
            <div>
              <label className={label}>@ Instagram</label>
              <input value={instagram} onChange={e => setInstagram(e.target.value)} className={campo} placeholder="joao.silva" />
            </div>
            <div>
              <label className={label}>Seguidores</label>
              <input value={seguidores} onChange={e => setSeguidores(e.target.value)} className={campo} placeholder="5k, 10k..." />
            </div>
            <div>
              <label className={label}>Nicho</label>
              <input value={nicho} onChange={e => setNicho(e.target.value)} className={campo} placeholder="Moda, Humor..." />
            </div>
            <div>
              <label className={label}>Cidade</label>
              <input value={cidade} onChange={e => setCidade(e.target.value)} className={campo} placeholder="Caruaru" />
            </div>
            <div>
              <label className={label}>Estado</label>
              <select value={estado} onChange={e => setEstado(e.target.value)} className={campo}>
                <option value="">—</option>
                {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="px-6 py-4 flex items-center justify-between gap-3 bg-gray-50">
          {erro && <p className="text-sm text-red-600">{erro}</p>}
          <div className="flex gap-3 ml-auto">
            <Link
              href="/afiliados/lista"
              className="text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={salvando}
              className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
            >
              {salvando ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              Cadastrar e aprovar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
