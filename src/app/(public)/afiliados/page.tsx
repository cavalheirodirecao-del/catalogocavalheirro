import Link from "next/link";
import { ArrowRight, TrendingUp, Package, Share2, CheckCircle } from "lucide-react";
import { TIERS_VAREJO, TIERS_ATACADO } from "@/lib/afiliados";

const NIVEL_EMOJI: Record<string, string> = {
  Bronze: "🥉",
  Prata: "🥈",
  Ouro: "🥇",
  Platina: "💎",
  Diamante: "🔥",
};

const PASSOS_VAREJO = [
  { num: "01", titulo: "Inscreva-se", desc: "Preencha o formulário. Aprovamos em até 48h." },
  { num: "02", titulo: "Receba o kit", desc: "A cada 15 dias você recebe peças Cavalheiro para divulgar." },
  { num: "03", titulo: "Divulgue e ganhe", desc: "Cada venda pelo seu link gera comissão. Quanto mais vende, maior a taxa." },
];

const PASSOS_ATACADO = [
  { num: "01", titulo: "Inscreva-se", desc: "Preencha o formulário. Aprovamos em até 48h." },
  { num: "02", titulo: "Receba seu link", desc: "Link exclusivo + cupom de desconto para compartilhar com seu público." },
  { num: "03", titulo: "Divulgue e ganhe", desc: "Foco em volume. Cada venda pelo seu link gera comissão automática." },
];

export default function AfiliadosPage() {
  return (
    <div className="bg-[#0E1117] min-h-screen">
      {/* Hero */}
      <section className="relative pt-24 pb-20 px-4 text-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#B8965A]/[0.06] blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#B8965A]/10 border border-[#B8965A]/20 rounded-full px-4 py-1.5 mb-8">
            <TrendingUp size={12} className="text-[#B8965A]" />
            <span className="text-xs font-space-mono tracking-[0.2em] text-[#B8965A] uppercase">
              Programa de Afiliados
            </span>
          </div>

          <h1 className="font-bebas text-[clamp(3.5rem,12vw,8rem)] leading-none tracking-[0.06em] text-white mb-6">
            VENDA CAVALHEIRO.<br />
            <span className="text-[#B8965A]">GANHE COMISSÃO.</span>
          </h1>

          <p className="text-lg text-white/50 font-dm-sans max-w-xl mx-auto leading-relaxed mb-10">
            Escolha o modelo que faz sentido para o seu perfil e comece a lucrar divulgando moda masculina do Polo de Toritama.
          </p>

          <Link
            href="/afiliados/login"
            className="inline-flex items-center gap-2 border border-white/20 text-white/70 font-dm-sans text-sm px-6 py-3 rounded-full hover:border-white/40 hover:text-white transition"
          >
            Já tenho conta — entrar
          </Link>
        </div>
      </section>

      {/* Dois programas */}
      <section className="bg-[#F8F8F6] py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-space-mono text-xs tracking-[0.3em] text-[#1C1C1A]/40 uppercase mb-3">
              Escolha seu modelo
            </p>
            <h2 className="font-bebas text-5xl sm:text-6xl text-[#1C1C1A] tracking-wide">
              DOIS PROGRAMAS.<br />UM OBJETIVO.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card Varejo */}
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
              <div className="bg-[#1C1C1A] px-8 pt-8 pb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">👕</span>
                  <div>
                    <p className="font-space-mono text-xs tracking-[0.2em] text-white/40 uppercase">Programa</p>
                    <h3 className="font-bebas text-3xl text-white tracking-wide leading-none">Afiliado Varejo</h3>
                  </div>
                </div>
                <p className="text-sm text-white/50 font-dm-sans leading-relaxed">
                  Receba peças Cavalheiro em casa a cada 15 dias e divulgue nas suas redes. Ideal para criadores de conteúdo de moda.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 bg-[#B8965A]/20 border border-[#B8965A]/30 rounded-full px-3 py-1">
                  <Package size={12} className="text-[#B8965A]" />
                  <span className="text-xs font-dm-sans text-[#B8965A]">Inclui kit de peças</span>
                </div>
              </div>
              <div className="px-8 py-6 flex-1 flex flex-col">
                <p className="text-xs font-space-mono tracking-[0.15em] text-gray-400 uppercase mb-3">Níveis e comissões</p>
                <div className="space-y-2 flex-1">
                  {TIERS_VAREJO.map((t, i) => (
                    <div key={t.nivel} className={`flex items-center justify-between rounded-xl px-4 py-2.5 ${i === TIERS_VAREJO.length - 1 ? "bg-[#B8965A] text-white" : "bg-gray-50"}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{NIVEL_EMOJI[t.nivel]}</span>
                        <span className={`text-sm font-dm-sans font-semibold ${i === TIERS_VAREJO.length - 1 ? "text-white" : "text-[#1C1C1A]"}`}>{t.nivel}</span>
                        <span className={`text-xs ${i === TIERS_VAREJO.length - 1 ? "text-white/70" : "text-gray-400"}`}>
                          {t.max != null ? `${t.min}–${t.max} vnd` : `${t.min}+ vnd`}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-dm-sans ${i === TIERS_VAREJO.length - 1 ? "text-white/80" : "text-gray-400"}`}>
                          {"pecas" in t ? t.pecas : ""}
                        </span>
                        <span className={`font-bebas text-lg tracking-wide ${i === TIERS_VAREJO.length - 1 ? "text-white" : "text-[#B8965A]"}`}>
                          {t.pct}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/afiliados/cadastro/varejo"
                  className="mt-6 flex items-center justify-center gap-2 bg-[#1C1C1A] text-white font-dm-sans font-bold text-sm px-6 py-3.5 rounded-xl hover:bg-[#1C1C1A]/80 transition"
                >
                  Quero ser Afiliado Varejo <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Card Atacado */}
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
              <div className="bg-[#B8965A] px-8 pt-8 pb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🔥</span>
                  <div>
                    <p className="font-space-mono text-xs tracking-[0.2em] text-white/60 uppercase">Programa</p>
                    <h3 className="font-bebas text-3xl text-white tracking-wide leading-none">Afiliado Atacado</h3>
                  </div>
                </div>
                <p className="text-sm text-white/80 font-dm-sans leading-relaxed">
                  Só link + cupom exclusivo. Divulgue oportunidades de atacado para revenda e ganhe comissão por volume. Sem receber peças.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-3 py-1">
                  <Share2 size={12} className="text-white" />
                  <span className="text-xs font-dm-sans text-white">Apenas link + comissão</span>
                </div>
              </div>
              <div className="px-8 py-6 flex-1 flex flex-col">
                <p className="text-xs font-space-mono tracking-[0.15em] text-gray-400 uppercase mb-3">Níveis e comissões</p>
                <div className="space-y-2 flex-1">
                  {TIERS_ATACADO.map((t, i) => (
                    <div key={t.nivel} className={`flex items-center justify-between rounded-xl px-4 py-2.5 ${i === TIERS_ATACADO.length - 1 ? "bg-[#1C1C1A] text-white" : "bg-gray-50"}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{NIVEL_EMOJI[t.nivel]}</span>
                        <span className={`text-sm font-dm-sans font-semibold ${i === TIERS_ATACADO.length - 1 ? "text-white" : "text-[#1C1C1A]"}`}>{t.nivel}</span>
                        <span className={`text-xs ${i === TIERS_ATACADO.length - 1 ? "text-white/60" : "text-gray-400"}`}>
                          {t.max != null ? `${t.min}–${t.max} vnd` : `${t.min}+ vnd`}
                        </span>
                      </div>
                      <span className={`font-bebas text-lg tracking-wide ${i === TIERS_ATACADO.length - 1 ? "text-[#B8965A]" : "text-[#B8965A]"}`}>
                        {t.pct}%
                      </span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/afiliados/cadastro/atacado"
                  className="mt-6 flex items-center justify-center gap-2 bg-[#B8965A] text-white font-dm-sans font-bold text-sm px-6 py-3.5 rounded-xl hover:bg-[#B8965A]/80 transition"
                >
                  Quero ser Afiliado Atacado <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-400 mt-8 font-dm-sans">
            Comissão calculada sobre o valor total de cada pedido confirmado. Reavaliação mensal.
          </p>
        </div>
      </section>

      {/* Como funciona — Varejo */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-space-mono text-xs tracking-[0.3em] text-white/30 uppercase mb-3">
              Afiliado Varejo
            </p>
            <h2 className="font-bebas text-5xl sm:text-6xl text-white tracking-wide">
              COMO FUNCIONA
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {PASSOS_VAREJO.map(p => (
              <div key={p.num} className="text-center">
                <p className="font-bebas text-6xl text-[#B8965A]/30 tracking-wide mb-4">{p.num}</p>
                <h3 className="font-bebas text-2xl text-white tracking-wide mb-3">{p.titulo.toUpperCase()}</h3>
                <p className="text-sm text-white/40 font-dm-sans leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona — Atacado */}
      <section className="bg-[#F8F8F6] py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-space-mono text-xs tracking-[0.3em] text-[#1C1C1A]/40 uppercase mb-3">
              Afiliado Atacado
            </p>
            <h2 className="font-bebas text-5xl sm:text-6xl text-[#1C1C1A] tracking-wide">
              COMO FUNCIONA
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {PASSOS_ATACADO.map(p => (
              <div key={p.num} className="text-center">
                <p className="font-bebas text-6xl text-[#B8965A]/30 tracking-wide mb-4">{p.num}</p>
                <h3 className="font-bebas text-2xl text-[#1C1C1A] tracking-wide mb-3">{p.titulo.toUpperCase()}</h3>
                <p className="text-sm text-[#1C1C1A]/50 font-dm-sans leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios comuns */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-bebas text-4xl sm:text-5xl text-white tracking-wide">
              EM AMBOS OS PROGRAMAS
            </h2>
          </div>
          <ul className="space-y-4">
            {[
              "Dashboard para acompanhar suas vendas em tempo real",
              "Link exclusivo por catálogo com rastreamento automático",
              "Comissão paga mensalmente via transferência",
              "Sem investimento inicial — 100% gratuito",
              "A Cavalheiro cuida de todo atendimento e envio",
              "Suporte direto com a equipe Cavalheiro",
            ].map(b => (
              <li key={b} className="flex items-start gap-3">
                <CheckCircle size={18} className="text-[#B8965A] shrink-0 mt-0.5" />
                <span className="text-base font-dm-sans text-white/70">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-[#F8F8F6] py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-bebas text-5xl sm:text-7xl text-[#1C1C1A] tracking-wide">
              COMECE AGORA
            </h2>
            <p className="text-[#1C1C1A]/50 font-dm-sans mt-3">
              Escolha o programa ideal para o seu perfil e inscreva-se gratuitamente.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/afiliados/cadastro/varejo"
              className="inline-flex items-center gap-2 bg-[#1C1C1A] text-white font-dm-sans font-bold text-sm px-8 py-4 rounded-full hover:bg-[#1C1C1A]/80 transition"
            >
              👕 Afiliado Varejo <ArrowRight size={16} />
            </Link>
            <Link
              href="/afiliados/cadastro/atacado"
              className="inline-flex items-center gap-2 bg-[#B8965A] text-white font-dm-sans font-bold text-sm px-8 py-4 rounded-full hover:bg-[#B8965A]/80 transition"
            >
              🔥 Afiliado Atacado <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
