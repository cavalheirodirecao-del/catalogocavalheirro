import Link from "next/link";
import { ArrowRight, CheckCircle, Star, MapPin, TrendingUp, Shield, Zap, Users, Phone } from "lucide-react";

const BENEFICIOS = [
  {
    icon: Shield,
    titulo: "Know-how consolidado",
    desc: "Décadas de experiência em jeanswear do Polo de Toritama. Você herda um modelo já testado — produção, fornecedores, precificação, logística.",
  },
  {
    icon: TrendingUp,
    titulo: "Marca com posicionamento",
    desc: "Cavalheiro é uma marca de moda masculina com identidade forte, não apenas um atacado. Você vende lifestyle, não só produto.",
  },
  {
    icon: Zap,
    titulo: "Operação plug & play",
    desc: "Sistema de gestão, catálogos digitais, treinamento de equipe e suporte contínuo. Você foca nas vendas, nós cuidamos do resto.",
  },
  {
    icon: Users,
    titulo: "Rede de revendedores",
    desc: "Acesso à base de clientes e vendedores da rede Cavalheiro. Você não começa do zero — começa com impulso.",
  },
];

const ITENS_MODELO = [
  "Licença de uso da marca Cavalheiro",
  "Mix completo de produtos do polo de Toritama",
  "Tabelas exclusivas de franqueados",
  "Sistema de gestão e catálogos digitais",
  "Treinamento presencial e suporte continuado",
  "Material de marketing e identidade visual",
  "Acesso à rede de vendedores Cavalheiro",
  "Consultoria de abertura e estruturação",
];

const FAQ = [
  {
    pergunta: "Preciso ter experiência no setor de moda?",
    resposta: "Não é obrigatório, mas ajuda. O modelo inclui treinamento completo e suporte próximo durante a implantação. Muitos de nossos parceiros começaram sem experiência no setor.",
  },
  {
    pergunta: "Qual o investimento inicial?",
    resposta: "O investimento varia conforme o formato da operação (loja física, atacado ou digital). Entre em contato para receber uma proposta personalizada.",
  },
  {
    pergunta: "Vocês já têm franquias funcionando?",
    resposta: "Sim. Nossa primeira unidade franqueada fica em Maceió (AL) e está em operação. Estamos expandindo para outras regiões do Brasil.",
  },
  {
    pergunta: "Posso operar como atacado sem loja física?",
    resposta: "Sim. O modelo é flexível e pode ser estruturado como atacado digital, operação híbrida ou loja física.",
  },
];

export default function FranquiaPage() {
  return (
    <div className="bg-[#0E1117]">
        {/* ── Hero ─────────────────────────────────────── */}
        <section className="relative min-h-[80vh] flex flex-col items-center justify-center overflow-hidden px-4 text-center">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#F5C400]/[0.05] blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-[#F5C400]/10 border border-[#F5C400]/20 rounded-full px-4 py-1.5 mb-8">
              <Star size={12} className="text-[#F5C400]" />
              <span className="text-xs font-space-mono tracking-[0.2em] text-[#F5C400] uppercase">
                Seja um franqueado Cavalheiro
              </span>
            </div>

            <h1 className="font-bebas text-[clamp(4rem,14vw,10rem)] leading-none tracking-[0.05em] text-white mb-6">
              FRANQUIA<br />CAVALHEIRO
            </h1>

            <p className="text-lg sm:text-xl text-white/50 font-dm-sans max-w-2xl mx-auto leading-relaxed mb-10">
              Venda moda masculina com a força de uma marca do Polo de Toritama.
              Você investe no know-how. Nós entregamos o modelo completo.
            </p>

            <a
              href="https://wa.me/5581998229477?text=Olá%20Wallyson%2C%20tenho%20interesse%20em%20saber%20mais%20sobre%20a%20franquia%20Cavalheiro."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#F5C400] text-[#0E1117] font-dm-sans font-bold text-sm px-8 py-4 rounded-full hover:bg-[#F5C400]/90 transition"
            >
              Agendar apresentação <ArrowRight size={16} />
            </a>
          </div>
        </section>

        {/* ── Primeira unidade — social proof ─────────── */}
        <section className="bg-[#F8F8F6] py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-6">
              <MapPin size={16} className="text-[#B8965A]" />
              <span className="font-space-mono text-xs tracking-[0.3em] text-[#1C1C1A]/50 uppercase">
                Primeira unidade
              </span>
            </div>
            <h2 className="font-bebas text-4xl sm:text-5xl text-[#1C1C1A] tracking-wide mb-4">
              JÁ ESTAMOS EM MACEIÓ
            </h2>
            <p className="text-base text-[#1C1C1A]/60 font-dm-sans max-w-2xl mx-auto leading-relaxed">
              Nossa primeira franquia está em operação em Maceió (AL). Ainda no início da jornada,
              mas já mostrando o caminho. Cada unidade que abrimos fortalece a marca e comprova o modelo.
              Você entra numa rede que está crescendo.
            </p>
          </div>
        </section>

        {/* ── Benefícios ──────────────────────────────── */}
        <section className="py-20 px-4 border-t border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <p className="font-space-mono text-xs tracking-[0.3em] text-white/30 uppercase mb-3">
                O que você recebe
              </p>
              <h2 className="font-bebas text-5xl sm:text-6xl text-white tracking-wide">
                O MODELO COMPLETO
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {BENEFICIOS.map(({ icon: Icon, titulo, desc }) => (
                <div
                  key={titulo}
                  className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-4 hover:border-white/15 transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#F5C400]/10 border border-[#F5C400]/20 flex items-center justify-center">
                    <Icon size={20} className="text-[#F5C400]" />
                  </div>
                  <p className="font-bebas text-xl tracking-wide text-white">{titulo.toUpperCase()}</p>
                  <p className="text-sm text-white/40 font-dm-sans leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── O que está incluso ──────────────────────── */}
        <section className="bg-[#F8F8F6] py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="font-space-mono text-xs tracking-[0.3em] text-[#1C1C1A]/40 uppercase mb-3">
                  Modelo de negócio
                </p>
                <h2 className="font-bebas text-4xl sm:text-5xl text-[#1C1C1A] tracking-wide mb-6">
                  TUDO QUE VOCÊ<br />PRECISA PARA COMEÇAR
                </h2>
                <p className="text-base text-[#1C1C1A]/60 font-dm-sans leading-relaxed mb-8">
                  Você não precisa reinventar a roda. A Cavalheiro já percorreu o caminho —
                  fornecedores, processos, posicionamento. Você compra o resultado de anos
                  de experiência e começa com vantagem.
                </p>
                <a
                  href="https://wa.me/5581998229477?text=Olá%20Wallyson%2C%20quero%20conhecer%20o%20modelo%20de%20franquia%20Cavalheiro."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#1C1C1A] text-white font-dm-sans font-semibold text-sm px-6 py-3 rounded-full hover:bg-black transition"
                >
                  Falar com Wallyson <ArrowRight size={14} />
                </a>
              </div>

              <ul className="space-y-3">
                {ITENS_MODELO.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-[#B8965A] shrink-0 mt-0.5" />
                    <span className="text-sm font-dm-sans text-[#1C1C1A]/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────── */}
        <section className="py-20 px-4 border-t border-white/5">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-14">
              <p className="font-space-mono text-xs tracking-[0.3em] text-white/30 uppercase mb-3">
                Dúvidas frequentes
              </p>
              <h2 className="font-bebas text-4xl sm:text-5xl text-white tracking-wide">
                PERGUNTAS & RESPOSTAS
              </h2>
            </div>

            <div className="space-y-4">
              {FAQ.map(({ pergunta, resposta }) => (
                <div
                  key={pergunta}
                  className="bg-white/[0.03] border border-white/8 rounded-2xl p-6"
                >
                  <p className="font-dm-sans font-semibold text-white mb-2">{pergunta}</p>
                  <p className="text-sm text-white/50 font-dm-sans leading-relaxed">{resposta}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Final ───────────────────────────────── */}
        <section className="bg-[#F5C400] py-20 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="font-bebas text-5xl sm:text-7xl text-[#0E1117] tracking-wide">
              PRONTO PARA<br />DAR O PRÓXIMO PASSO?
            </h2>
            <p className="text-base text-[#0E1117]/70 font-dm-sans max-w-lg mx-auto leading-relaxed">
              Agende uma apresentação com Wallyson, Diretor de Novos Negócios da Cavalheiro.
              Sem compromisso — só uma conversa franca sobre o modelo e o potencial da sua região.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://wa.me/5581998229477?text=Olá%20Wallyson%2C%20quero%20agendar%20uma%20apresentação%20sobre%20a%20franquia%20Cavalheiro."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#0E1117] text-white font-dm-sans font-bold text-sm px-8 py-4 rounded-full hover:bg-[#1C1C1A] transition"
              >
                <Phone size={16} />
                WhatsApp · +55 81 99822-9477
              </a>
            </div>

            <p className="text-xs text-[#0E1117]/50 font-space-mono tracking-wider">
              WALLYSON · DIRETOR DE NOVOS NEGÓCIOS
            </p>
          </div>
        </section>
      </div>

  );
}
