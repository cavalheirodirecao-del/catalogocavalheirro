"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  Heart, Star, TrendingUp, Shield, Users, Coffee,
  MapPin, ArrowRight, ExternalLink
} from "lucide-react";

const BENEFICIOS = [
  {
    icon: Heart,
    titulo: "Ambiente Familiar",
    desc: "Somos uma empresa com raízes na comunidade. Aqui você é tratado como parte da família, não como número.",
  },
  {
    icon: TrendingUp,
    titulo: "Crescimento Real",
    desc: "Valorizamos quem quer crescer. Temos plano de carreira claro e incentivamos o desenvolvimento constante.",
  },
  {
    icon: Shield,
    titulo: "Estabilidade",
    desc: "Empresa sólida no mercado do Polo do Agreste há anos. Registro em carteira, benefícios e segurança.",
  },
  {
    icon: Star,
    titulo: "Moda com Propósito",
    desc: "Trabalhe com moda que tem identidade nordestina. Um produto com qualidade e orgulho regional.",
  },
  {
    icon: Users,
    titulo: "Equipe Unida",
    desc: "Time jovem, motivado e colaborativo. Aqui as conquistas são celebradas juntos.",
  },
  {
    icon: Coffee,
    titulo: "Qualidade de Vida",
    desc: "Horários respeitosos, bom ambiente de trabalho e respeito pela vida pessoal de cada colaborador.",
  },
];

// URLs das fotos — substitua pelos links reais do Supabase Storage ou outro host
const FOTO_FABRICA_1 = "";   // fábrica — foto grande principal
const FOTO_FABRICA_2 = "";   // fábrica — foto secundária
const FOTO_EQUIPE    = "";   // nossa equipe
const FOTO_SHOWROOM_1 = "";  // showroom — foto principal
const FOTO_SHOWROOM_2 = "";  // showroom — foto secundária

const EVENTOS = [
  { ano: "2024", titulo: "Expo Moda Agreste", desc: "Participação no maior evento do Polo do Agreste. Equipe reunida, novos lançamentos e muito networking." },
  { ano: "2024", titulo: "Confraternização Anual", desc: "Celebrando mais um ano de conquistas com toda a equipe. Festa, música e muita alegria." },
  { ano: "2023", titulo: "Feira de Caruaru", desc: "Presença forte no Fash Trade com estandes que representam o melhor da Cavalheiro." },
  { ano: "2023", titulo: "Treinamento de Equipe", desc: "Workshop interno de atendimento ao cliente e novas coleções. Aprendizado em conjunto." },
];

function FotoCard({ src, label, tall }: { src: string; label: string; tall?: boolean }) {
  return (
    <div className={`relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 ${tall ? "h-64" : "h-48"}`}>
      {src ? (
        <img src={src} alt={label} className="w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-xs font-space-mono text-white/20">{label}</p>
        </div>
      )}
      <div className="absolute bottom-3 left-3">
        <span className="bg-black/60 backdrop-blur text-white/70 text-xs px-2.5 py-1 rounded-full font-dm-sans">{label}</span>
      </div>
    </div>
  );
}

interface Props {
  googleFormUrl: string | null;
}

export default function TrabalheConoscoClient({ googleFormUrl }: Props) {
  const formRef = useRef<HTMLDivElement>(null);

  function rolarParaForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="bg-[#0A0A0A] text-white overflow-x-hidden">

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-end pb-20 px-6 sm:px-12 overflow-hidden">
        {/* Textura diagonal */}
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: "repeating-linear-gradient(45deg, white 0, white 1px, transparent 1px, transparent 14px)" }} />
        {/* Gradiente dourado sutil */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#B8954A]/8 via-transparent to-transparent" />
        {/* Linha de acento */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#B8954A] via-[#D4AF7A] to-transparent" />

        {/* Número de fundo */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 font-bebas text-[28vw] leading-none text-white/[0.03] select-none pointer-events-none pr-8 tracking-tighter">
          CV
        </div>

        <div className="relative z-10 max-w-5xl">
          <p className="text-[#B8954A] text-xs tracking-[0.4em] uppercase mb-6 font-dm-sans">
            Cavalheiro · Toritama, PE
          </p>
          <h1 className="font-bebas text-[15vw] sm:text-[12vw] md:text-[10vw] leading-[0.88] tracking-tight text-white">
            FAÇA<br />
            <span style={{ WebkitTextStroke: "1px #B8954A", color: "transparent" }}>
              PARTE
            </span><br />
            DA HISTÓRIA
          </h1>
          <p className="mt-8 text-white/50 text-lg sm:text-xl max-w-xl leading-relaxed font-cormorant italic">
            Somos mais que uma marca de moda — somos uma família de pessoas que acreditam no trabalho com orgulho,
            na qualidade nordestina e no crescimento juntos.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <button
              onClick={rolarParaForm}
              className="flex items-center gap-2 bg-[#B8954A] text-black font-dm-sans font-semibold px-8 py-4 rounded-full hover:bg-[#D4AF7A] transition-all hover:gap-3 text-sm tracking-wide"
            >
              Quero me candidatar <ArrowRight size={16} />
            </button>
            <Link href="/sobre"
              className="flex items-center gap-2 border border-white/20 text-white/60 hover:text-white hover:border-white/40 font-dm-sans px-8 py-4 rounded-full transition text-sm">
              Conhecer a empresa
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-white/30" />
        </div>
      </section>

      {/* ── Manifesto ───────────────────────────────────── */}
      <section className="bg-[#B8954A] py-16 px-6 sm:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-cormorant text-3xl sm:text-4xl md:text-5xl text-black leading-tight italic font-light">
            "Cada peça que criamos carrega o DNA do Nordeste —
            e as mãos que a fazem são parte dessa identidade."
          </p>
          <p className="mt-6 text-black/60 text-sm font-dm-sans tracking-widest uppercase">
            Equipe Cavalheiro
          </p>
        </div>
      </section>

      {/* ── Benefícios ──────────────────────────────────── */}
      <section className="py-24 px-6 sm:px-12 bg-[#111111]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-[#B8954A] text-xs tracking-[0.4em] uppercase font-dm-sans mb-3">Por que trabalhar aqui</p>
            <h2 className="font-bebas text-6xl sm:text-8xl text-white tracking-tight leading-none">
              BENEFÍCIOS
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFICIOS.map((b, i) => {
              const Icon = b.icon;
              return (
                <div key={i}
                  className="group border border-white/10 rounded-2xl p-7 hover:border-[#B8954A]/40 hover:bg-[#B8954A]/5 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-[#B8954A]/10 flex items-center justify-center mb-5 group-hover:bg-[#B8954A]/20 transition">
                    <Icon size={18} className="text-[#B8954A]" />
                  </div>
                  <h3 className="font-bebas text-2xl tracking-wide text-white mb-2">{b.titulo}</h3>
                  <p className="text-white/50 text-sm leading-relaxed font-dm-sans">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Fotos da empresa ────────────────────────────── */}
      <section className="py-24 px-6 sm:px-12 bg-[#0A0A0A]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-[#B8954A] text-xs tracking-[0.4em] uppercase font-dm-sans mb-3">Nossa empresa</p>
            <h2 className="font-bebas text-6xl sm:text-8xl text-white tracking-tight leading-none">
              NOSSA<br />FÁBRICA
            </h2>
          </div>

          {/* Fábrica */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <FotoCard src={FOTO_FABRICA_1} label="Nossa Fábrica" tall />
            <FotoCard src={FOTO_FABRICA_2} label="Nossa Fábrica" tall />
          </div>

          {/* Equipe + Showroom */}
          <div className="grid grid-cols-3 gap-3">
            <FotoCard src={FOTO_EQUIPE} label="Nossa Equipe" />
            <FotoCard src={FOTO_SHOWROOM_1} label="Showroom" />
            <FotoCard src={FOTO_SHOWROOM_2} label="Showroom" />
          </div>
        </div>
      </section>

      {/* ── Eventos ─────────────────────────────────────── */}
      <section className="py-24 px-6 sm:px-12 bg-[#111111]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-[#B8954A] text-xs tracking-[0.4em] uppercase font-dm-sans mb-3">Nossa história</p>
            <h2 className="font-bebas text-6xl sm:text-8xl text-white tracking-tight leading-none">
              EVENTOS &amp;<br />MOMENTOS
            </h2>
          </div>

          <div className="space-y-0">
            {EVENTOS.map((ev, i) => (
              <div key={i} className={`flex gap-8 py-8 border-b border-white/10 group hover:bg-white/[0.02] px-4 -mx-4 rounded-xl transition`}>
                <div className="shrink-0">
                  <span className="font-bebas text-5xl text-[#B8954A]/40 group-hover:text-[#B8954A]/70 transition leading-none">{ev.ano}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bebas text-3xl text-white tracking-wide mb-2">{ev.titulo}</h3>
                  <p className="text-white/50 text-sm leading-relaxed font-dm-sans max-w-xl">{ev.desc}</p>
                </div>
                <div className="shrink-0 self-center">
                  <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 text-xs font-space-mono">
                    IMG
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Formulário ──────────────────────────────────── */}
      <section ref={formRef} id="candidatura" className="py-24 px-6 sm:px-12 bg-[#0A0A0A]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-[#B8954A] text-xs tracking-[0.4em] uppercase font-dm-sans mb-3">Candidate-se</p>
            <h2 className="font-bebas text-6xl sm:text-8xl text-white tracking-tight leading-none">
              QUERO<br />TRABALHAR<br />
              <span style={{ WebkitTextStroke: "1px #B8954A", color: "transparent" }}>AQUI</span>
            </h2>
            <p className="mt-6 text-white/50 text-base max-w-lg font-cormorant italic text-xl">
              Preencha o formulário abaixo. Nossa equipe analisará seu perfil e entrará em contato em breve.
            </p>
          </div>

          {googleFormUrl ? (
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-white">
              <iframe
                src={googleFormUrl}
                width="100%"
                height="800"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                title="Formulário de candidatura Cavalheiro"
                className="w-full"
              >
                Carregando…
              </iframe>
            </div>
          ) : (
            <div className="border-2 border-dashed border-white/20 rounded-2xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#B8954A]/10 border border-[#B8954A]/20 flex items-center justify-center mx-auto">
                <ExternalLink size={24} className="text-[#B8954A]" />
              </div>
              <h3 className="font-bebas text-3xl text-white">Formulário em breve</h3>
              <p className="text-white/40 text-sm max-w-sm mx-auto font-dm-sans leading-relaxed">
                O formulário de candidatura será configurado em breve.<br />
                Configure a URL do Google Forms nas <strong className="text-white/60">Configurações</strong> do painel admin.
              </p>
              <Link href="/contato"
                className="inline-flex items-center gap-2 bg-[#B8954A] text-black font-dm-sans font-semibold px-6 py-3 rounded-full hover:bg-[#D4AF7A] transition text-sm mt-2">
                Entrar em contato <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Final ───────────────────────────────────── */}
      <section className="py-20 px-6 sm:px-12 bg-[#B8954A]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-bebas text-5xl text-black leading-tight">
              DÚVIDAS? FALE<br />COM A GENTE
            </h2>
            <p className="text-black/60 text-sm mt-2 font-dm-sans">Nossa equipe de RH está aqui para ajudar.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/contato"
              className="flex items-center gap-2 bg-black text-white font-dm-sans font-semibold px-6 py-3 rounded-full hover:bg-black/80 transition text-sm">
              <MapPin size={14} /> Falar com RH
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
