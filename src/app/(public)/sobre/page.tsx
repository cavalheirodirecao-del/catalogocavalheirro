import { MapPin, Clock, Phone, Heart, Gem, Users, Leaf } from "lucide-react";

const VALORES = [
  { icon: Gem, titulo: "Qualidade", desc: "Cada peça passa por controle rigoroso antes de chegar ao cliente. Tecidos selecionados, costuras reforçadas." },
  { icon: Heart, titulo: "Família", desc: "Somos uma empresa familiar. Cada decisão é tomada com o cuidado de quem cuida da própria casa." },
  { icon: Users, titulo: "Comunidade", desc: "Fazemos parte do Polo do Agreste Pernambucano. Compramos local, geramos empregos, fortalecemos a região." },
  { icon: Leaf, titulo: "Moda Nordestina", desc: "Valorizamos a identidade do Nordeste. Nossa moda tem personalidade, cor e a força do povo pernambucano." },
];

const LOJAS = [
  {
    cidade: "Toritama",
    estado: "PE",
    endereco: "Rua Principal, 123 — Centro",
    horario: "Seg–Sab: 7h às 17h",
    telefone: "(81) 99999-0001",
    whatsapp: "5581999990001",
    descricao: "Nossa loja sede, no coração do polo jeanswear.",
    destaque: true,
  },
  {
    cidade: "Caruaru",
    estado: "PE",
    endereco: "Av. das Nações, 456 — Centro",
    horario: "Seg–Sab: 8h às 18h",
    telefone: "(81) 99999-0002",
    whatsapp: "5581999990002",
    descricao: "Nossa loja no maior polo comercial do Nordeste.",
    destaque: false,
  },
  {
    cidade: "Santa Cruz do Capibaribe",
    estado: "PE",
    endereco: "Rua do Comércio, 789 — Centro",
    horario: "Seg–Sab: 7h às 17h",
    telefone: "(81) 99999-0003",
    whatsapp: "5581999990003",
    descricao: "Loja no segundo maior polo de confecções do Brasil.",
    destaque: false,
  },
];

const TIMELINE = [
  { ano: "1990", marco: "Fundação", desc: "A Cavalheiro nasce em Toritama como um pequeno atelier familiar." },
  { ano: "2000", marco: "Expansão", desc: "Abertura das lojas em Caruaru e Santa Cruz do Capibaribe." },
  { ano: "2010", marco: "Atacado", desc: "Lançamento do catálogo atacado com distribuição para lojistas de todo Brasil." },
  { ano: "2020", marco: "Digital", desc: "Plataforma online de pedidos para atacado e fábrica." },
  { ano: "hoje", marco: "Presente", desc: "Mais de 500 lojistas atendidos em todo o território nacional." },
];

export default function SobrePage() {
  return (
    <div className="bg-[#F4EFE6]">
      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative bg-[#1A1714] py-32 px-4 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "linear-gradient(to right, #B8965A 1px, transparent 1px), linear-gradient(to bottom, #B8965A 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="font-space-mono text-xs tracking-[0.4em] text-[#B8965A] uppercase mb-6">
            Nossa História
          </p>
          <h1 className="font-cormorant italic font-light text-[clamp(3rem,8vw,7rem)] leading-none text-white">
            Tradição e Qualidade
          </h1>
          <div className="mt-6 w-16 h-px bg-[#B8965A] mx-auto" />
          <p className="mt-8 text-lg text-white/50 font-dm-sans max-w-xl mx-auto leading-relaxed">
            Do Agreste Pernambucano para o Brasil. Décadas cultivando a arte de vestir bem.
          </p>
        </div>
      </section>

      {/* ── História + Timeline ──────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="font-space-mono text-xs tracking-[0.3em] text-[#B8965A] uppercase mb-4">Desde 1990</p>
              <h2 className="font-cormorant text-4xl sm:text-5xl font-semibold text-[#1A1714] leading-tight mb-6">
                Uma marca nascida<br />no coração do Nordeste
              </h2>
              <div className="space-y-4 text-[#1A1714]/60 font-dm-sans leading-relaxed">
                <p>
                  A Cavalheiro nasceu em Toritama, cidade conhecida mundialmente como a capital do jeans.
                  Fundada por uma família apaixonada por moda e qualidade, começamos com uma máquina de costura
                  e muita determinação.
                </p>
                <p>
                  Ao longo dos anos, crescemos preservando o que nos diferencia: atenção aos detalhes,
                  qualidade que você sente ao tocar e um atendimento que parece conversa de vizinho.
                </p>
                <p>
                  Hoje atendemos centenas de lojistas em todo o Brasil, do varejo ao atacado,
                  sempre com o mesmo cuidado de quando éramos uma pequena oficina familiar.
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-[#B8965A]/30" />
              <div className="space-y-8 pl-10">
                {TIMELINE.map((item) => (
                  <div key={item.ano} className="relative">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#B8965A] ring-4 ring-[#F4EFE6]" />
                    <p className="font-bebas text-xl tracking-wider text-[#B8965A]">{item.ano.toUpperCase()}</p>
                    <p className="font-semibold text-[#1A1714] font-dm-sans">{item.marco}</p>
                    <p className="text-sm text-[#1A1714]/50 font-dm-sans leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Valores ─────────────────────────────────────── */}
      <section className="bg-[#1A1714] py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-space-mono text-xs tracking-[0.3em] text-[#B8965A] uppercase mb-4">Quem somos</p>
            <h2 className="font-cormorant text-4xl sm:text-5xl font-semibold text-white">
              Nossos Valores
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALORES.map(({ icon: Icon, titulo, desc }) => (
              <div key={titulo} className="space-y-4">
                <div className="w-12 h-12 rounded-full border border-[#B8965A]/30 flex items-center justify-center">
                  <Icon size={20} className="text-[#B8965A]" />
                </div>
                <p className="font-cormorant text-xl font-semibold text-white">{titulo}</p>
                <p className="text-sm text-white/40 font-dm-sans leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Lojas ───────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-space-mono text-xs tracking-[0.3em] text-[#B8965A] uppercase mb-4">Onde estamos</p>
            <h2 className="font-cormorant text-4xl sm:text-5xl font-semibold text-[#1A1714]">
              Nossas Lojas
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {LOJAS.map((loja) => (
              <div
                key={loja.cidade}
                className={`bg-white border rounded-2xl p-6 space-y-4 ${
                  loja.destaque ? "border-[#B8965A] shadow-lg" : "border-[#D5C9B5]"
                }`}
              >
                {loja.destaque && (
                  <span className="text-[10px] font-space-mono tracking-widest text-[#B8965A] uppercase bg-[#B8965A]/10 px-2 py-0.5 rounded-full">
                    Sede
                  </span>
                )}
                <div>
                  <p className="font-cormorant text-2xl font-semibold text-[#1A1714]">{loja.cidade}</p>
                  <p className="text-xs text-[#B8965A] font-space-mono tracking-wider">{loja.estado}</p>
                </div>
                <p className="text-sm text-[#1A1714]/50 font-dm-sans leading-relaxed">{loja.descricao}</p>
                <div className="space-y-2 pt-2 border-t border-[#D5C9B5]">
                  <div className="flex items-start gap-2 text-sm text-[#1A1714]/60">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-[#B8965A]" />
                    <span className="font-dm-sans">{loja.endereco}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#1A1714]/60">
                    <Clock size={14} className="shrink-0 text-[#B8965A]" />
                    <span className="font-dm-sans">{loja.horario}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#1A1714]/60">
                    <Phone size={14} className="shrink-0 text-[#B8965A]" />
                    <span className="font-dm-sans">{loja.telefone}</span>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${loja.whatsapp}?text=Olá! Vim pelo site da Cavalheiro.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-[#1A1714] text-[#B8965A] font-dm-sans font-semibold text-sm py-2.5 rounded-lg hover:bg-[#B8965A] hover:text-white transition"
                >
                  WhatsApp
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
