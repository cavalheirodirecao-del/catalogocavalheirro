import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#080B10] border-t border-white/8 text-white/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">

          {/* Marca */}
          <div className="space-y-3">
            <p className="font-bebas text-2xl tracking-[0.2em] text-white">CAVALHEIRO</p>
            <p className="text-xs leading-relaxed">
              Moda masculina do Polo de Confecções do Agreste Pernambucano.
              Qualidade direto da fábrica para você.
            </p>
            <div className="flex gap-3 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-white transition text-xs uppercase tracking-widest font-space-mono"
              >
                Instagram
              </a>
              <span className="text-white/20">·</span>
              <a
                href="https://wa.me/5581999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-white transition text-xs uppercase tracking-widest font-space-mono"
              >
                WhatsApp
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-white/30 font-space-mono mb-3">Navegação</p>
            {[
              { href: "/", label: "Home" },
              { href: "/sobre", label: "Sobre" },
              { href: "/lookbook", label: "Lookbook" },
              { href: "/contato", label: "Contato" },
            ].map((l) => (
              <div key={l.href}>
                <Link href={l.href} className="text-sm hover:text-white/80 transition">
                  {l.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Catálogos */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-white/30 font-space-mono mb-3">Catálogos</p>
            {[
              { href: "/varejo", label: "Varejo", color: "#FF4D00" },
              { href: "/atacado", label: "Atacado", color: "#B8965A" },
              { href: "/fabrica", label: "Fábrica", color: "#F5C400" },
            ].map((c) => (
              <div key={c.href} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <Link href={c.href} className="text-sm hover:text-white/80 transition">
                  {c.label}
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p>© {new Date().getFullYear()} Cavalheiro. Todos os direitos reservados.</p>
          <Link href="/login" className="text-white/20 hover:text-white/40 transition font-space-mono">
            Área restrita
          </Link>
        </div>
      </div>
    </footer>
  );
}
