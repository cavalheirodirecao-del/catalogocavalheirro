"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatarMoeda } from "@/lib/utils";
import { TIERS_VAREJO, TIERS_ATACADO } from "@/lib/afiliados";
import { Copy, CheckCheck, Award, TrendingUp, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface Pedido {
  numero: number;
  total: number;
  status: string;
  criadoEm: string;
  catalogo: string;
  nomeCliente: string;
  comissao: number;
}

interface Pagamento {
  id: string;
  periodo: string;
  valor: number;
  qtdPedidos: number;
  status: string;
}

interface DadosMe {
  id: string;
  nome: string;
  email: string;
  slug: string;
  status: string;
  tipo: "VAREJO" | "ATACADO";
  qtdVendasMes: number;
  totalVendasMes: number;
  comissaoMes: number;
  tierAtual: { pct: number; nivel: string; faixa: string };
  proximo: { min: number; pct: number; nivel: string; faltam: number } | null;
  pedidosMes: Pedido[];
  pagamentos: Pagamento[];
}

const NIVEL_EMOJI: Record<string, string> = {
  Bronze: "🥉", Prata: "🥈", Ouro: "🥇", Platina: "💎", Diamante: "🔥",
};

const STATUS_COR: Record<string, string> = {
  CONFIRMADO: "text-blue-400 bg-blue-500/10",
  ENVIADO:    "text-purple-400 bg-purple-500/10",
  CONCLUIDO:  "text-green-400 bg-green-500/10",
  PENDENTE:   "text-yellow-400 bg-yellow-500/10",
  CANCELADO:  "text-red-400 bg-red-500/10",
};

const CATALOGO_LABEL: Record<string, string> = {
  VAREJO: "Varejo", ATACADO: "Atacado", FABRICA: "Grandes Clientes",
};

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "";

export default function AfiliadoDashboard() {
  const router = useRouter();
  const [dados, setDados] = useState<DadosMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiado, setCopiado] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/afiliados/me")
      .then(r => {
        if (r.status === 401) { router.replace("/afiliados/login"); return null; }
        return r.json();
      })
      .then(data => {
        if (data) { setDados(data); }
        setLoading(false);
      });
  }, []);

  function copiar(texto: string, key: string) {
    navigator.clipboard.writeText(texto);
    setCopiado(key);
    setTimeout(() => setCopiado(null), 2500);
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (!dados) return null;

  const tiers = dados.tipo === "ATACADO" ? TIERS_ATACADO : TIERS_VAREJO;
  const tierAtualObj = tiers.find(t => t.nivel === dados.tierAtual.nivel) ?? tiers[0];
  const progresso = dados.proximo
    ? Math.round(
        ((dados.qtdVendasMes - tierAtualObj.min) /
          (dados.proximo.min - tierAtualObj.min)) * 100
      )
    : 100;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <div className="relative overflow-hidden px-6 pt-12 pb-8 border-b border-white/10">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, white 0px, white 1px, transparent 1px, transparent 12px)" }} />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#B8954A] to-transparent" />
        <div className="relative max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="font-bebas text-2xl tracking-[0.2em] text-white/90">CAVALHEIRO</p>
            <h1 className="text-lg font-bold mt-0.5">{dados.nome}</h1>
            <p className="text-white/30 text-xs font-mono mt-0.5">/{dados.slug} · afiliado</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/afiliados/login" })}
            className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs transition"
          >
            <LogOut size={13} />
            Sair
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        {/* Cards resumo do mês */}
        <div>
          <p className="text-xs text-white/30 uppercase tracking-widest mb-3 font-space-mono">
            Mês atual
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Vendas</p>
              <p className="text-4xl font-bold">{dados.qtdVendasMes}</p>
              <p className="text-white/30 text-xs mt-1">pedidos confirmados</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Comissão</p>
              <p className="text-3xl font-bold text-[#B8954A]">{formatarMoeda(dados.comissaoMes)}</p>
              <p className="text-white/30 text-xs mt-1">{NIVEL_EMOJI[dados.tierAtual.nivel]} {dados.tierAtual.nivel} · {dados.tierAtual.pct}%</p>
            </div>
          </div>
        </div>

        {/* Tier + progresso */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-[#B8954A]" />
              <span className="font-semibold">Nível de Comissão</span>
            </div>
            <span className="text-2xl font-bold text-[#B8954A]">
              {NIVEL_EMOJI[dados.tierAtual.nivel]} {dados.tierAtual.nivel}
            </span>
          </div>

          <div className="space-y-1.5">
            {tiers.map(t => {
              const ativo = t.nivel === dados.tierAtual.nivel;
              const passado = tiers.findIndex(x => x.nivel === dados.tierAtual.nivel) > tiers.findIndex(x => x.nivel === t.nivel);
              return (
                <div
                  key={t.nivel}
                  className={`flex items-center justify-between text-sm px-3 py-2 rounded-lg ${
                    ativo ? "bg-[#B8954A]/20 border border-[#B8954A]/40" : passado ? "opacity-40" : "opacity-25"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{NIVEL_EMOJI[t.nivel]}</span>
                    <span>{t.nivel}</span>
                    <span className="text-white/30 text-xs">{t.max != null ? `${t.min}–${t.max} vnd` : `${t.min}+ vnd`}</span>
                  </span>
                  <span className={`font-bold ${ativo ? "text-[#B8954A]" : ""}`}>{t.pct}%</span>
                  {ativo && <span className="text-[10px] text-[#B8954A] font-medium uppercase tracking-wider">atual</span>}
                </div>
              );
            })}
          </div>

          {dados.proximo && (
            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-xs text-white/40">
                <span>{dados.qtdVendasMes} vendas</span>
                <span>Meta: {dados.proximo.nivel} — {dados.proximo.min} vnd ({dados.proximo.pct}%)</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#B8954A] to-[#D4AF7A] rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, progresso))}%` }}
                />
              </div>
              <p className="text-xs text-white/30 text-center">
                Faltam <strong className="text-white/60">{dados.proximo.faltam}</strong> {dados.proximo.faltam !== 1 ? "vendas" : "venda"} para {NIVEL_EMOJI[dados.proximo.nivel]} {dados.proximo.nivel} ({dados.proximo.pct}%)
              </p>
            </div>
          )}
        </div>

        {/* Links de venda */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-white/40" />
            <span className="font-semibold text-sm">Seus links de venda</span>
          </div>
          {[
            { label: "Varejo", path: "varejo" },
            { label: "Atacado Revenda", path: "atacado" },
            { label: "Atacado +40 peças", path: "fabrica" },
          ].map(({ label, path }) => {
            const link = `${BASE_URL}/${path}?ref=${dados.slug}`;
            return (
              <div key={path} className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-xl px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/40 mb-0.5">{label}</p>
                  <p className="text-xs text-white/50 font-mono truncate">/{path}?ref={dados.slug}</p>
                </div>
                <button
                  onClick={() => copiar(link, path)}
                  className="shrink-0 text-white/40 hover:text-white transition"
                >
                  {copiado === path
                    ? <CheckCheck size={15} className="text-green-400" />
                    : <Copy size={15} />
                  }
                </button>
              </div>
            );
          })}
        </div>

        {/* Pedidos do mês */}
        {dados.pedidosMes.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs text-white/40 uppercase tracking-widest font-space-mono">
              Pedidos do mês ({dados.pedidosMes.length})
            </h2>
            <div className="space-y-2">
              {dados.pedidosMes.map(p => (
                <div key={p.numero} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold">#{p.numero}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COR[p.status] ?? "text-white/30 bg-white/5"}`}>
                        {p.status}
                      </span>
                      <span className="text-[10px] text-white/30">{CATALOGO_LABEL[p.catalogo]}</span>
                    </div>
                    <p className="text-xs text-white/30 truncate">{p.nomeCliente}</p>
                    <p className="text-[10px] text-white/20">{new Date(p.criadoEm).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold">{formatarMoeda(p.total)}</p>
                    <p className="text-xs text-[#B8954A]">+{formatarMoeda(p.comissao)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {dados.pedidosMes.length === 0 && (
          <div className="text-center py-10 text-white/20 space-y-2">
            <TrendingUp size={32} className="mx-auto opacity-30" />
            <p className="text-sm">Nenhuma venda este mês ainda.</p>
            <p className="text-xs">Compartilhe seu link para começar!</p>
          </div>
        )}

        {/* Histórico de pagamentos */}
        {dados.pagamentos.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs text-white/40 uppercase tracking-widest font-space-mono">
              Histórico de pagamentos
            </h2>
            <div className="space-y-2">
              {dados.pagamentos.map(pg => (
                <div key={pg.id} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-mono text-white/60">{pg.periodo}</p>
                    <p className="text-xs text-white/30">{pg.qtdPedidos} vendas</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatarMoeda(Number(pg.valor))}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      pg.status === "PAGO"
                        ? "text-green-400 bg-green-500/10"
                        : "text-yellow-400 bg-yellow-500/10"
                    }`}>
                      {pg.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
