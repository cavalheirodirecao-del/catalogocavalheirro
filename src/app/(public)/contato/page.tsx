import { SITE_URL, jsonLd } from "@/lib/seo";
import { MessageCircle, MapPin, Clock, Phone, Mail } from "lucide-react";

const LOJAS = [{ cidade: "Caruaru", estado: "PE", endereco: "R. Rui Limeira Rosal, 425 — Petrópolis, Caruaru — PE, 55030-001", horario: "Consulte os horários pelo WhatsApp", telefone: "(81) 99339-3065", whatsapp: "5581993393065", destaque: false }];

// WhatsApp principal (loja sede)
const WHATSAPP_PRINCIPAL = "5581993393065";
const MSG_PADRAO = encodeURIComponent("Olá! Vim pelo site da Cavalheiro e gostaria de mais informações.");

export default function ContatoPage() {
  return (
    <div className="bg-[#F8F8F6]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ "@context": "https://schema.org", "@type": "ClothingStore", "@id": `${SITE_URL}/contato#loja`, name: "Cavalheiro", url: `${SITE_URL}/contato`, telephone: "+55-81-99339-3065", email: "cavalheirodirecao@gmail.com", sameAs: ["https://www.instagram.com/cavalheiro.oficial/"], address: { "@type": "PostalAddress", streetAddress: "R. Rui Limeira Rosal, 425 — Petrópolis", addressLocality: "Caruaru", addressRegion: "PE", postalCode: "55030-001", addressCountry: "BR" } }) }} />
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
              Tire suas dúvidas sobre produtos, pedidos e atendimento.
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
            CARUARU–PE
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

          <div className="grid grid-cols-1 gap-6">
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
            <h2 className="font-dm-sans font-black text-3xl text-[#1C1C1A]">Cavalheiro — Caruaru, PE</h2>
          </div>
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            <iframe
              src="https://maps.google.com/maps?q=R.%20Rui%20Limeira%20Rosal%2C%20425%20Caruaru%20PE&output=embed"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa Cavalheiro Caruaru"
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
              href="https://www.instagram.com/cavalheiro.oficial/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-5 py-2.5 text-sm font-dm-sans font-semibold text-[#1C1C1A] hover:border-[#1C1C1A] transition"
            >
              <span className="text-base">📷</span>
              @cavalheiro.oficial
            </a>
            <a
              href="mailto:cavalheirodirecao@gmail.com"
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
