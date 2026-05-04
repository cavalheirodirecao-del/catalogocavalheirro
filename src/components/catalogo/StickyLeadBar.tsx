"use client";

import { Lock, ChevronRight } from "lucide-react";
import { TipoCatalogo } from "@prisma/client";

interface Props {
  catalogo: TipoCatalogo;
  onAbrir: () => void;
}

const TEMA = {
  ATACADO: {
    bg: "bg-[#1A1714]",
    text: "text-[#B8965A]",
    sub: "text-[#B8965A]/60",
    btn: "bg-[#B8965A] text-white hover:bg-[#a07f4e]",
    border: "border-[#B8965A]/20",
  },
  FABRICA: {
    bg: "bg-[#0E1117]",
    text: "text-[#F5C400]",
    sub: "text-[#F5C400]/50",
    btn: "bg-[#F5C400] text-[#0E1117] hover:bg-yellow-300",
    border: "border-[#F5C400]/15",
  },
  VAREJO: {
    bg: "bg-[#1C1C1A]",
    text: "text-white",
    sub: "text-white/50",
    btn: "bg-[#FF4D00] text-white hover:bg-orange-600",
    border: "border-white/10",
  },
} as const;

export default function StickyLeadBar({ catalogo, onAbrir }: Props) {
  const t = TEMA[catalogo] ?? TEMA.ATACADO;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 ${t.bg} border-t ${t.border} shadow-2xl`}>
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <Lock size={14} className={t.text} />
          <div className="min-w-0">
            <p className={`text-sm font-semibold ${t.text} truncate`}>
              Preços visíveis após cadastro gratuito
            </p>
            <p className={`text-xs ${t.sub} hidden sm:block`}>
              Nome e telefone — leva menos de 30 segundos
            </p>
          </div>
        </div>
        <button
          onClick={onAbrir}
          className={`shrink-0 flex items-center gap-1.5 ${t.btn} font-semibold text-sm px-5 py-2 rounded-full transition`}
        >
          Ver preços
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
