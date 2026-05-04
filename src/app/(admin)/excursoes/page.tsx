"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Truck, Plus, Search, Pencil, AlertCircle, MapPin, Phone, Users } from "lucide-react";

const ESTADOS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

interface Excursao {
  id: string;
  nome: string;
  telefone: string | null;
  estado: string | null;
  cidadesAtendidas: string | null;
  nomeResponsavel: string | null;
  telefoneResponsavel: string | null;
  cidade: string | null;
  setor: string | null;
  vaga: string | null;
  ativo: boolean;
  criadoEm: string;
  _count: { pedidos: number };
}

interface PedidoSemVinculo {
  id: string;
  numero: number;
  nomeClienteAvulso: string | null;
  excursaoTexto: string | null;
  criadoEm: string;
  status: string;
}

export default function ExcursoesPage() {
  const [excursoes, setExcursoes] = useState<Excursao[]>([]);
  const [semVinculo, setSemVinculo] = useState<PedidoSemVinculo[]>([]);
  const [loading, setLoading] = useState(true);

  const [busca, setBusca] = useState("");
  const [estado, setEstado] = useState("");
  const [ativo, setAtivo] = useState("");

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setLoading(true);
    const [excRes, pedRes] = await Promise.all([
      fetch("/api/excursoes"),
      fetch("/api/pedidos"),
    ]);
    const excData = await excRes.json();
    const pedData = await pedRes.json();
    setExcursoes(excData);
    setSemVinculo(pedData.filter((p: any) => p.tipoEnvio === "EXCURSAO" && !p.excursaoId));
    setLoading(false);
  }

  async function buscarFiltrado() {
    setLoading(true);
    const params = new URLSearchParams();
    if (busca)  params.set("busca", busca);
    if (estado) params.set("estado", estado);
    if (ativo)  params.set("ativo", ativo);
    const data = await fetch(`/api/excursoes?${params}`).then(r => r.json());
    setExcursoes(data);
    setLoading(false);
  }

  function nomeDoTexto(texto: string | null) {
    if (!texto) return "—";
    try { return JSON.parse(texto).nome ?? "—"; } catch { return texto; }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck size={22} /> Excursões
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie excursões parceiras e vincule pedidos</p>
        </div>
        <Link href="/excursoes/novo"
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
          <Plus size={15} /> Nova Excursão
        </Link>
      </div>

      {/* Alerta: pedidos sem vínculo */}
      {semVinculo.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-amber-600" />
            <p className="text-sm font-semibold text-amber-800">
              {semVinculo.length} pedido{semVinculo.length !== 1 ? "s" : ""} de excursão sem vínculo
            </p>
          </div>
          <div className="space-y-1.5">
            {semVinculo.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between text-xs">
                <span className="text-amber-700">
                  <span className="font-mono font-bold">#{p.numero}</span>
                  {" — "}{p.nomeClienteAvulso ?? "Cliente"}
                  {" — "}<span className="italic">{nomeDoTexto(p.excursaoTexto)}</span>
                </span>
                <Link href={`/pedidos/${p.id}`} className="text-amber-600 hover:underline font-medium">
                  Vincular →
                </Link>
              </div>
            ))}
            {semVinculo.length > 5 && (
              <p className="text-xs text-amber-600 font-medium">+{semVinculo.length - 5} outros</p>
            )}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] border border-gray-200 rounded-lg px-3 py-2">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            onKeyDown={e => e.key === "Enter" && buscarFiltrado()}
            placeholder="Buscar por nome ou cidade..."
            className="text-sm flex-1 outline-none"
          />
        </div>
        <select value={estado} onChange={e => setEstado(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="">Todos os estados</option>
          {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
        </select>
        <select value={ativo} onChange={e => setAtivo(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="">Todas</option>
          <option value="true">Ativas</option>
          <option value="false">Inativas</option>
        </select>
        <button onClick={buscarFiltrado}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
          Filtrar
        </button>
        <button onClick={() => { setBusca(""); setEstado(""); setAtivo(""); carregar(); }}
          className="text-gray-500 text-sm hover:text-gray-800 transition">
          Limpar
        </button>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
        </div>
      ) : excursoes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Truck size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhuma excursão cadastrada.</p>
          <Link href="/excursoes/novo" className="text-sm text-black underline mt-2 inline-block">
            Cadastrar primeira excursão
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-600">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Localização</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Cidades Atendidas</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Responsável Parcerias</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Pedidos</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {excursoes.map(e => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-900">{e.nome}</p>
                    {e.telefone && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Phone size={11} />{e.telefone}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {(e.cidade || e.estado) ? (
                      <p className="text-xs text-gray-700 flex items-center gap-1">
                        <MapPin size={11} className="text-gray-400 shrink-0" />
                        {[e.cidade, e.estado].filter(Boolean).join(" — ")}
                      </p>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                    {(e.setor || e.vaga) && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {[e.setor && `Setor: ${e.setor}`, e.vaga && `Vaga: ${e.vaga}`].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-[180px]">
                    <p className="text-xs text-gray-600 truncate">{e.cidadesAtendidas ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    {e.nomeResponsavel ? (
                      <div>
                        <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
                          <Users size={11} className="text-gray-400 shrink-0" />{e.nomeResponsavel}
                        </p>
                        {e.telefoneResponsavel && (
                          <p className="text-xs text-gray-400">{e.telefoneResponsavel}</p>
                        )}
                      </div>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-bold text-sm ${e._count.pedidos > 0 ? "text-gray-900" : "text-gray-300"}`}>
                      {e._count.pedidos}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {e.ativo
                      ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Ativa</span>
                      : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Inativa</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/excursoes/${e.id}`}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition">
                      <Pencil size={13} /> Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
