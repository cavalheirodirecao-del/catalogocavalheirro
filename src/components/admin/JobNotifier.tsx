"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, X, FileDown } from "lucide-react";

type Job = { id: string; status: "PENDENTE" | "PROCESSANDO" | "CONCLUIDO" | "ERRO"; tabelaPreco: string; layout: string; pdfUrl: string | null; erro: string | null };

export default function JobNotifier() {
  const [avisos, setAvisos] = useState<Job[]>([]);
  const vistos = useRef(new Set<string>());
  const inicializado = useRef(false);
  const processando = useRef(new Set<string>());

  useEffect(() => {
    let ativo = true;
    async function sincronizar() {
      try {
        const res = await fetch("/api/catalogo/jobs", { cache: "no-store" });
        if (!res.ok || !ativo) return;
        const jobs: Job[] = await res.json();
        for (const job of jobs.filter(j => j.status === "PENDENTE")) {
          if (processando.current.has(job.id)) continue;
          processando.current.add(job.id);
          fetch(`/api/catalogo/processar/${job.id}`, { method: "POST" }).finally(() => processando.current.delete(job.id));
        }
        if (!inicializado.current) {
          jobs.forEach(j => vistos.current.add(j.id));
          inicializado.current = true;
          return;
        }
        const prontos = jobs.filter(j => (j.status === "CONCLUIDO" || j.status === "ERRO") && !vistos.current.has(j.id));
        if (prontos.length) {
          prontos.forEach(j => vistos.current.add(j.id));
          setAvisos(prontos.slice(0, 3));
        }
      } catch { /* o próximo ciclo tenta novamente */ }
    }
    sincronizar();
    const timer = window.setInterval(sincronizar, 4000);
    return () => { ativo = false; window.clearInterval(timer); };
  }, []);

  if (!avisos.length) return null;
  return <div className="fixed right-5 top-5 z-[100] w-[min(92vw,380px)] space-y-2" aria-live="polite">
    {avisos.map(job => <div key={job.id} className="bg-white border border-gray-200 shadow-xl rounded-xl p-4 flex gap-3">
      <div className={job.status === "CONCLUIDO" ? "text-green-600" : "text-red-600"}><CheckCircle2 size={20} /></div>
      <div className="flex-1 min-w-0"><p className="text-sm font-semibold">{job.status === "CONCLUIDO" ? "Arquivo pronto" : "Falha na geração"}</p><p className="text-xs text-gray-500 mt-1 truncate">{job.status === "CONCLUIDO" ? "Seu catálogo foi gerado." : job.erro ?? "Não foi possível gerar o arquivo."}</p>{job.status === "CONCLUIDO" && <Link href="/catalogos/historico" className="inline-flex items-center gap-1 mt-2 text-xs font-medium underline"><FileDown size={13} /> Abrir geração de PDFs</Link>}</div>
      <button aria-label="Fechar aviso" onClick={() => setAvisos(lista => lista.filter(item => item.id !== job.id))} className="text-gray-400 hover:text-gray-700"><X size={16} /></button>
    </div>)}
  </div>;
}
