"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Truck, Save, ExternalLink } from "lucide-react";
import { formatarMoeda } from "@/lib/utils";

const ESTADOS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const INPUT = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black";
const LABEL = "block text-xs font-medium text-gray-500 mb-1";

const STATUS_COR: Record<string, string> = {
  PENDENTE: "bg-yellow-100 text-yellow-700",
  CONFIRMADO: "bg-blue-100 text-blue-700",
  SEPARANDO: "bg-purple-100 text-purple-700",
  ENVIADO: "bg-indigo-100 text-indigo-700",
  CONCLUIDO: "bg-green-100 text-green-700",
  CANCELADO: "bg-red-100 text-red-700",
};

export default function ExcursaoEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [stats, setStats] = useState({ totalPedidos: 0, totalVolume: 0 });
  const [pedidos, setPedidos] = useState<any[]>([]);

  const [form, setForm] = useState({
    nome: "", telefone: "", estado: "", cidadesAtendidas: "",
    nomeResponsavel: "", telefoneResponsavel: "",
    cidade: "", setor: "", vaga: "", pontoReferencia: "", obs: "", ativo: true,
  });

  function set(field: string, value: any) {
    setForm(f => ({ ...f, [field]: value }));
  }

  useEffect(() => {
    fetch(`/api/excursoes/${id}`)
      .then(r => r.json())
      .then(data => {
        setForm({
          nome: data.nome ?? "",
          telefone: data.telefone ?? "",
          estado: data.estado ?? "",
          cidadesAtendidas: data.cidadesAtendidas ?? "",
          nomeResponsavel: data.nomeResponsavel ?? "",
          telefoneResponsavel: data.telefoneResponsavel ?? "",
          cidade: data.cidade ?? "",
          setor: data.setor ?? "",
          vaga: data.vaga ?? "",
          pontoReferencia: data.pontoReferencia ?? "",
          obs: data.obs ?? "",
          ativo: data.ativo,
        });
        setStats(data.stats ?? { totalPedidos: 0, totalVolume: 0 });
        setPedidos(data.pedidos ?? []);
        setLoading(false);
      });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso(false);
    setSalvando(true);
    try {
      const res = await fetch(`/api/excursoes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro ?? "Erro ao salvar.");
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/excursoes" className="text-gray-400 hover:text-gray-700 transition">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck size={20} /> {form.nome || "Editar Excursão"}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Edite os dados da excursão</p>
        </div>
      </div>

      {/* Cards de stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-1">Pedidos vinculados</p>
          <p className="text-2xl font-bold">{stats.totalPedidos}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 mb-1">Volume total</p>
          <p className="text-2xl font-bold text-green-600">{formatarMoeda(stats.totalVolume)}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {erro && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{erro}</p>}
        {sucesso && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">✓ Salvo com sucesso!</p>}

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 text-sm">Dados da Excursão</h2>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.ativo} onChange={e => set("ativo", e.target.checked)}
                className="w-4 h-4 accent-black" />
              <span className="text-gray-600">Ativa</span>
            </label>
          </div>

          <div>
            <label className={LABEL}>Nome *</label>
            <input required value={form.nome} onChange={e => set("nome", e.target.value)} className={INPUT} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Telefone</label>
              <input value={form.telefone} onChange={e => set("telefone", e.target.value)} className={INPUT} />
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
              placeholder="Recife, Caruaru, Olinda..." className={INPUT} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm">Localização</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={LABEL}>Cidade onde fica</label>
              <input value={form.cidade} onChange={e => set("cidade", e.target.value)} className={INPUT} /></div>
            <div><label className={LABEL}>Setor</label>
              <input value={form.setor} onChange={e => set("setor", e.target.value)} className={INPUT} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={LABEL}>Vaga</label>
              <input value={form.vaga} onChange={e => set("vaga", e.target.value)} className={INPUT} /></div>
            <div><label className={LABEL}>Ponto de referência</label>
              <input value={form.pontoReferencia} onChange={e => set("pontoReferencia", e.target.value)} className={INPUT} /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm">Contato para Parcerias</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={LABEL}>Nome do responsável</label>
              <input value={form.nomeResponsavel} onChange={e => set("nomeResponsavel", e.target.value)} className={INPUT} /></div>
            <div><label className={LABEL}>Telefone do responsável</label>
              <input value={form.telefoneResponsavel} onChange={e => set("telefoneResponsavel", e.target.value)} className={INPUT} /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <label className={LABEL}>Observação</label>
          <textarea value={form.obs} onChange={e => set("obs", e.target.value)}
            rows={3} className={INPUT + " resize-none"} />
        </div>

        <button type="submit" disabled={salvando}
          className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50">
          <Save size={15} />
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>

      {/* Pedidos vinculados */}
      {pedidos.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-800">Pedidos Vinculados ({pedidos.length})</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">#</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Data</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pedidos.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-bold text-gray-800">#{p.numero}</td>
                    <td className="px-4 py-3 text-gray-700">{p.nomeClienteAvulso ?? "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COR[p.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{formatarMoeda(Number(p.total))}</td>
                    <td className="px-4 py-3 text-right text-gray-400 text-xs">
                      {new Date(p.criadoEm).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/pedidos/${p.id}`}
                        className="text-gray-400 hover:text-gray-700 transition">
                        <ExternalLink size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
