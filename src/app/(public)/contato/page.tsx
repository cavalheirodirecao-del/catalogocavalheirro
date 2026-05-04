import { MessageCircle, MapPin, Clock, Phone, Mail } from "lucide-react";

const LOJAS = [
  {
    cidade: "Toritama",
    estado: "PE",
    endereco: "Rua Principal, 123 — Centro",
    horario: "Seg–Sab: 7h às 17h",
    telefone: "(81) 99999-0001",
    whatsapp: "5581999990001",
    destaque: true,
  },
  {
    cidade: "Caruaru",
    estado: "PE",
    endereco: "Av. das Nações, 456 — Centro",
    horario: "Seg–Sab: 8h às 18h",
    telefone: "(81) 99999-0002",
    whatsapp: "5581999990002",
    destaque: false,
  },
  {
    cidade: "Santa Cruz do Capibaribe",
    estado: "PE",
    endereco: "Rua do Comércio, 789 — Centro",
    horario: "Seg–Sab: 7h às 17h",
    telefone: "(81) 99999-0003",
    whatsapp: "5581999990003",
    destaque: false,
  },
];

// WhatsApp principal (loja sede)
const WHATSAPP_PRINCIPAL = "5581999990001";
const MSG_PADRAO = encodeURIComponent("Olá! Vim pelo site da Cavalheiro e gostaria de mais informações.");

export default function ContatoPage() {
  return (
    <div className="bg-[#F8F8F6]">
      {/* ── Hero ────────────────────────────────────────── */}
      <section className="bg-[#1C1C1A] py-28 px-4 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #FF4D00 1px, transparent 1px), linear-gradient(to bottom, #FF4D00 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="font-space-mono text-xs tracking-[0.4em] text-[#FF4D00]/60 uppercase mb-6">Fale com a gente</p>
          <h1 className="font-bebas text-[clamp(3rem,10vw,8rem)] leading-none tracking-[0.05em] text-white">
            CONTATO
          </h1>
          <p className="mt-6 text-lg text-white/40 font-dm-sans max-w-md mx-auto">
            Estamos prontos para atender você. Escolha o canal preferido.
          </p>
        </div>
      </section>

      {/* ── Botão WhatsApp principal ─────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#25D366]/10 flex items-center justify-center mx-auto">
            <MessageCircle size={28} className="text-[#25D366]" />
          </div>
          <div>
            <h2 className="font-dm-sans font-bold text-2xl text-[#1C1C1A]">Atendimento rápido</h2>
            <p className="text-[#1C1C1A]/50 font-dm-sans mt-2">
              Resposta em menos de 1 hora em horário comercial.
            </p>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP_PRINCIPAL}?text=${MSG_PADRAO}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] text-white font-dm-sans font-bold text-base px-10 py-4 rounded-full hover:bg-[#20b958] transition shadow-lg shadow-[#25D366]/20"
          >
            <MessageCircle size={20} fill="white" />
            Chamar no WhatsApp
          </a>
          <p className="text-xs text-[#1C1C1A]/30 font-space-mono">
            SEG–SAB · 7H–17H · TORITAMA–PE
          </p>
        </div>
      </section>

      {/* ── Cards das lojas ─────────────────────────────── */}
      <section className="py-16 px-4 border-t border-[#1C1C1A]/8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-space-mono text-xs tracking-[0.3em] text-[#1C1C1A]/40 uppercase mb-3">Lojas físicas</p>
            <h2 className="font-dm-sans font-black text-3xl sm:text-4xl text-[#1C1C1A]">
              Nos visite pessoalmente
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {LOJAS.map((loja) => (
              <div
                key={loja.cidade}
                className={`bg-white rounded-2xl p-6 space-y-5 border ${
                  loja.destaque ? "border-[#FF4D00] shadow-lg shadow-[#FF4D00]/10" : "border-gray-100"
                }`}
              >
                {loja.destaque && (
                  <span className="text-[10px] font-space-mono tracking-widest text-[#FF4D00] uppercase bg-[#FF4D00]/8 px-2 py-0.5 rounded-full">
                    Sede
                  </span>
                )}
                <div>
                  <p className="font-dm-sans font-black text-xl text-[#1C1C1A]">{loja.cidade}</p>
                  <p className="text-xs text-gray-400 font-space-mono tracking-wider mt-0.5">{loja.estado}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2.5 text-sm text-[#1C1C1A]/60">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-[#FF4D00]" />
                    <span className="font-dm-sans">{loja.endereco}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-[#1C1C1A]/60">
                    <Clock size={14} className="shrink-0 text-[#FF4D00]" />
                    <span className="font-dm-sans">{loja.horario}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-[#1C1C1A]/60">
                    <Phone size={14} className="shrink-0 text-[#FF4D00]" />
                    <span className="font-dm-sans">{loja.telefone}</span>
                  </div>
                </div>

                <a
                  href={`https://wa.me/${loja.whatsapp}?text=${MSG_PADRAO}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#1C1C1A] text-white font-dm-sans font-semibold text-sm py-2.5 rounded-lg hover:bg-[#FF4D00] transition"
                >
                  <MessageCircle size={14} />
                  WhatsApp
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mapa ────────────────────────────────────────── */}
      <section className="py-16 px-4 border-t border-[#1C1C1A]/8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="font-space-mono text-xs tracking-[0.3em] text-[#1C1C1A]/40 uppercase mb-3">Localização</p>
            <h2 className="font-dm-sans font-black text-3xl text-[#1C1C1A]">Loja Sede — Toritama, PE</h2>
          </div>
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31537.18!2d-36.06!3d-8.00!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7ab0f7b0b0b0b0b1%3A0x0!2sToritama%2C+PE!5e0!3m2!1spt-BR!2sbr!4v1234567890"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa Cavalheiro Toritama"
            />
          </div>
        </div>
      </section>

      {/* ── Redes sociais ───────────────────────────────── */}
      <section className="py-16 px-4 border-t border-[#1C1C1A]/8">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <h2 className="font-dm-sans font-black text-2xl text-[#1C1C1A]">Siga nas redes</h2>
          <div className="flex items-center justify-center gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-5 py-2.5 text-sm font-dm-sans font-semibold text-[#1C1C1A] hover:border-[#1C1C1A] transition"
            >
              <span className="text-base">📷</span>
              @cavalheiro
            </a>
            <a
              href="mailto:contato@cavalheiro.com.br"
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-5 py-2.5 text-sm font-dm-sans font-semibold text-[#1C1C1A] hover:border-[#1C1C1A] transition"
            >
              <Mail size={16} />
              E-mail
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
