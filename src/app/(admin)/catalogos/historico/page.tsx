"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FileDown, Loader2, AlertCircle, CheckCircle2, Clock, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Job {
  id: string;
  status: "PENDENTE" | "PROCESSANDO" | "CONCLUIDO" | "ERRO";
  tabelaPreco: string;
  layout: string;
  pdfUrl: string | null;
  erro: string | null;
  criadoEm: string;
  concluidoEm: string | null;
}

const LABEL_TABELA: Record<string, string> = {
  VAREJO: "Varejo",
  ATACADO: "Atacado",
  FABRICA: "Fábrica",
  SEM_PRECO: "Sem preço",
};

const LABEL_LAYOUT: Record<string, string> = {
  UMA_FOTO: "Uma foto",
  TRES_FOTOS: "Três fotos",
};

function StatusBadge({ status }: { status: Job["status"] }) {
  if (status === "CONCLUIDO")
    return <span className="flex items-center gap-1.5 text-green-700 bg-green-50 border border-green-200 text-xs font-medium px-2.5 py-1 rounded-full"><CheckCircle2 size={12} /> Concluído</span>;
  if (status === "PROCESSANDO")
    return <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50 border border-blue-200 text-xs font-medium px-2.5 py-1 rounded-full"><Loader2 size={12} className="animate-spin" /> Gerando…</span>;
  if (status === "ERRO")
    return <span className="flex items-center gap-1.5 text-red-700 bg-red-50 border border-red-200 text-xs font-medium px-2.5 py-1 rounded-full"><AlertCircle size={12} /> Erro</span>;
  return <span className="flex items-center gap-1.5 text-gray-500 bg-gray-100 border border-gray-200 text-xs font-medium px-2.5 py-1 rounded-full"><Clock size={12} /> Aguardando</span>;
}

export default function HistoricoPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const processandoRef = useRef<Set<string>>(new Set());

  async function fetchJobs(): Promise<Job[]> {
    try {
      const res = await fetch("/api/catalogo/jobs");
      if (!res.ok) return [];
      const text = await res.text();
      if (!text) return [];
      const data: Job[] = JSON.parse(text);
      setJobs(data);
      setLoading(false);
      return data;
    } catch {
      setLoading(false);
      return [];
    }
  }

  // Dispara o processamento de jobs pendentes
  async function processarPendentes(lista: Job[]) {
    const pendentes = lista.filter(j => j.status === "PENDENTE" && !processandoRef.current.has(j.id));
    for (const job of pendentes) {
      processandoRef.current.add(job.id);
      fetch(`/api/catalogo/processar/${job.id}`, { method: "POST" })
        .then(() => processandoRef.current.delete(job.id))
        .catch(() => processandoRef.current.delete(job.id));
    }
  }

  useEffect(() => {
    fetchJobs().then(processarPendentes);

    // Polling a cada 3s enquanto há jobs ativos
    const interval = setInterval(async () => {
      const lista = await fetchJobs();
      const temAtivos = lista.some(j => j.status === "PENDENTE" || j.status === "PROCESSANDO");
      if (!temAtivos) clearInterval(interval);
      await processarPendentes(lista);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const temAtivos = jobs.some(j => j.status === "PENDENTE" || j.status === "PROCESSANDO");

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Catálogos PDF</h1>
          <p className="text-gray-500 text-sm mt-1">
            {temAtivos
              ? "Gerando catálogos em segundo plano…"
              : loading
                ? "Carregando…"
                : `${jobs.length} catálogo${jobs.length !== 1 ? "s" : ""} gerado${jobs.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/catalogos/gerar"
          className="flex items-center gap-2 bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          <Plus size={14} /> Novo catálogo
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32 text-gray-400">
          <Loader2 size={20} className="animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">Nenhum catálogo gerado ainda.</p>
          <Link href="/catalogos/gerar" className="text-black text-sm font-medium mt-3 inline-block hover:underline">
            Gerar o primeiro catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={job.status} />
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(job.criadoEm), { addSuffix: true, locale: ptBR })}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-800">
                  {LABEL_TABELA[job.tabelaPreco] ?? job.tabelaPreco}
                  <span className="font-normal text-gray-400 mx-1">·</span>
                  {LABEL_LAYOUT[job.layout] ?? job.layout}
                </p>
                {job.status === "ERRO" && job.erro && (
                  <p className="text-xs text-red-600 mt-1 truncate">{job.erro}</p>
                )}
              </div>

              {/* Ação */}
              {job.status === "CONCLUIDO" && job.pdfUrl && (
                <a
                  href={job.pdfUrl}
                  download
                  className="flex items-center gap-2 bg-black text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-gray-800 transition whitespace-nowrap"
                >
                  <FileDown size={14} /> Baixar PDF
                </a>
              )}
              {(job.status === "PENDENTE" || job.status === "PROCESSANDO") && (
                <div className="text-gray-300">
                  <Loader2 size={18} className="animate-spin" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
