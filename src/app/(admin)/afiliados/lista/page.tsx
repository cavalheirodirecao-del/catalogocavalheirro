"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users2, Clock, CheckCircle, XCircle, PauseCircle, ChevronRight, UserPlus, Copy, ExternalLink } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://catalogocavalheirro.vercel.app";

type StatusAfiliado = "PENDENTE" | "APROVADO" | "REJEITADO" | "SUSPENSO";

interface Afiliado {
  id: string;
  slug: string;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  tipo: "VAREJO" | "ATACADO";
  status: StatusAfiliado;
  criadoEm: string;
  usuario: { nome: string; email: string };
  _count: { pedidos: number };
}

const TABS: { label: string; value: StatusAfiliado; icon: any; cor: string }[] = [
  { label: "Pendentes", value: "PENDENTE",  icon: Clock,        cor: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  { label: "Aprovados", value: "APROVADO",  icon: CheckCircle,  cor: "text-green-600 bg-green-50 border-green-200"   },
  { label: "Rejeitados",value: "REJEITADO", icon: XCircle,      cor: "text-red-600 bg-red-50 border-red-200"         },
  { label: "Suspensos", value: "SUSPENSO",  icon: PauseCircle,  cor: "text-gray-600 bg-gray-50 border-gray-200"      },
];

function getLinkAfiliado(a: Afiliado) {
  return `${BASE_URL}/${a.tipo.toLowerCase()}?ref=${a.slug}`;
}

export default function AfiliadosAdminPage() {
  const [tabAtiva, setTabAtiva] = useState<StatusAfiliado>("PENDENTE");
  const [afiliados, setAfiliados] = useState<Afiliado[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiado, setCopiado] = useState<string | null>(null);

  function copiarLink(e: React.MouseEvent, id: string, url: string) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2000);
  }

  useEffect(() => {
    setLoading(true);
    fetch(`/api/afiliados?status=${tabAtiva}`)
      .then(r => r.json())
      .then(data => { setAfiliados(data); setLoading(false); });
  }, [tabAtiva]);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users2 size={22} />
            Afiliados
          </h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie inscrições e aprovações de afiliados</p>
        </div>
        <Link
          href="/afiliados/novo"
          className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition whitespace-nowrap"
        >
          <UserPlus size={15} />
          Cadastrar afiliado
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setTabAtiva(tab.value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium transition ${
              tabAtiva === tab.value
                ? tab.cor
                : "text-gray-500 bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
        </div>
      ) : afiliados.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users2 size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum afiliado {TABS.find(t => t.value === tabAtiva)?.label.toLowerCase()} no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {afiliados.map(a => (
            <Link
              key={a.id}
              href={`/afiliados/${a.id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-gray-900">{a.usuario.nome}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      a.tipo === "ATACADO"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}>
                      {a.tipo}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{a.usuario.email}</p>
                </div>
                <ChevronRight size={16} className="text-gray-300 shrink-0 mt-1" />
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">/{a.slug}</span>
                {a.cidade && <span>{a.cidade}{a.estado ? `, ${a.estado}` : ""}</span>}
              </div>

              {a.status === "APROVADO" && (
                <div
                  className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-2.5 py-1.5"
                  onClick={e => e.preventDefault()}
                >
                  <span className="font-mono text-[10px] text-green-700 truncate flex-1">
                    {getLinkAfiliado(a)}
                  </span>
                  <button
                    onClick={e => copiarLink(e, a.id, getLinkAfiliado(a))}
                    className="text-green-600 hover:text-green-800 shrink-0"
                    title="Copiar link"
                  >
                    {copiado === a.id ? <CheckCircle size={12} /> : <Copy size={12} />}
                  </button>
                  <a
                    href={getLinkAfiliado(a)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-800 shrink-0"
                    title="Abrir link"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-gray-50">
                <span>{a._count.pedidos} pedido{a._count.pedidos !== 1 ? "s" : ""}</span>
                <span>{new Date(a.criadoEm).toLocaleDateString("pt-BR")}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
