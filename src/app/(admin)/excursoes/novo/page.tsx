"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Truck } from "lucide-react";

const ESTADOS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const INPUT = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black";
const LABEL = "block text-xs font-medium text-gray-500 mb-1";

export default function NovaExcursaoPage() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const [form, setForm] = useState({
    nome: "", telefone: "", estado: "", cidadesAtendidas: "",
    nomeResponsavel: "", telefoneResponsavel: "",
    cidade: "", setor: "", vaga: "", pontoReferencia: "", obs: "",
  });

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      const res = await fetch("/api/excursoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro ?? "Erro ao salvar.");
      router.push("/excursoes");
    } catch (err: any) {
      setErro(err.message);
      setEnviando(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/excursoes" className="text-gray-400 hover:text-gray-700 transition">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck size={20} /> Nova Excursão
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Cadastre uma excursão parceira</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {erro && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{erro}</p>
        )}

        {/* Dados principais */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm">Dados da Excursão</h2>

          <div>
            <label className={LABEL}>Nome da excursão *</label>
            <input required value={form.nome} onChange={e => set("nome", e.target.value)}
              placeholder="Ex: Excursão do João" className={INPUT} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Telefone</label>
              <input value={form.telefone} onChange={e => set("telefone", e.target.value)}
                placeholder="(81) 99999-9999" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Estado de atuação</label>
              <select value={form.estado} onChange={e => set("estado", e.target.value)} className={INPUT}>
                <option value="">Selecionar</option>
                {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={LABEL}>Cidades atendidas</label>
            <input value={form.cidadesAtendidas} onChange={e => set("cidadesAtendidas", e.target.value)}
              placeholder="Ex: Recife, Caruaru, Olinda, Paulista..." className={INPUT} />
            <p className="text-xs text-gray-400 mt-1">Separe as cidades por vírgula</p>
          </div>
        </div>

        {/* Localização */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm">Localização em Toritama / Santa Cruz / Caruaru</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Cidade onde fica</label>
              <input value={form.cidade} onChange={e => set("cidade", e.target.value)}
                placeholder="Ex: Toritama" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Setor</label>
              <input value={form.setor} onChange={e => set("setor", e.target.value)}
                placeholder="Ex: Setor Amarelo" className={INPUT} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Vaga</label>
              <input value={form.vaga} onChange={e => set("vaga", e.target.value)}
                placeholder="Ex: Vaga 15" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Ponto de referência</label>
              <input value={form.pontoReferencia} onChange={e => set("pontoReferencia", e.target.value)}
                placeholder="Ex: Próximo ao portão 3" className={INPUT} />
            </div>
          </div>
        </div>

        {/* Responsável de parcerias */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm">Contato para Parcerias</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Nome do responsável</label>
              <input value={form.nomeResponsavel} onChange={e => set("nomeResponsavel", e.target.value)}
                placeholder="Nome completo" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Telefone do responsável</label>
              <input value={form.telefoneResponsavel} onChange={e => set("telefoneResponsavel", e.target.value)}
                placeholder="(81) 99999-9999" className={INPUT} />
            </div>
          </div>
        </div>

        {/* Observação */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <label className={LABEL}>Observação</label>
          <textarea value={form.obs} onChange={e => set("obs", e.target.value)}
            rows={3} placeholder="Informações adicionais sobre a excursão..."
            className={INPUT + " resize-none"} />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={enviando}
            className="flex-1 bg-black text-white py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50">
            {enviando ? "Salvando..." : "Cadastrar Excursão"}
          </button>
          <Link href="/excursoes"
            className="px-6 py-3 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-gray-400 transition text-center">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
