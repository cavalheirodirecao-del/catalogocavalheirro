"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";

const LINKS = [
  { href: "/",               label: "Home" },
  { href: "/sobre",          label: "Sobre" },
  { href: "/blog",           label: "Blog" },
  { href: "/franquia",       label: "Franquia" },
  { href: "/trabalhe-conosco", label: "Trabalhe Conosco" },
  { href: "/contato",        label: "Contato" },
];

const AFILIADOS_NAV = [
  { href: "/afiliados",       label: "Programa de Afiliados", desc: "Saiba como ganhar comissão", color: "#B8965A" },
  { href: "/afiliados/login", label: "Portal do Afiliado",    desc: "Acesse seu painel",          color: "#F5C400" },
];

export default function Navbar() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [revendedoresAberto, setRevendedoresAberto] = useState(false);
  const [afiliadosAberto, setAfiliadosAberto] = useState(false);
  const [qtdAtacado, setQtdAtacado] = useState(15);
  const [qtdFabrica, setQtdFabrica] = useState(40);
  const fecharTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fecharAfiliadosTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/configuracoes")
      .then(r => r.json())
      .then(data => {
        if (data?.qtdMinimaAtacado) setQtdAtacado(data.qtdMinimaAtacado);
        if (data?.qtdMinimaFabrica) setQtdFabrica(data.qtdMinimaFabrica);
      })
      .catch(() => {});
  }, []);

  const REVENDEDORES = [
    {
      href: "/atacado",
      label: "Atacado Revenda",
      desc: `Mín. ${qtdAtacado} peças sortidas`,
      color: "#B8965A",
    },
    {
      href: "/fabrica",
      label: "Atacado Grandes Clientes",
      desc: `+${qtdFabrica} peças — preço diferenciado`,
      color: "#F5C400",
    },
  ];

  const revendedoresAtivo =
    pathname.startsWith("/atacado") ||
    pathname.startsWith("/fabrica") ||
    pathname.startsWith("/revendedores");

  const afiliadosAtivo = pathname.startsWith("/afiliados");

  function abrirDropdown() {
    if (fecharTimerRef.current) clearTimeout(fecharTimerRef.current);
    setRevendedoresAberto(true);
  }

  function fecharDropdownComDelay() {
    fecharTimerRef.current = setTimeout(() => setRevendedoresAberto(false), 200);
  }

  function abrirAfiliadosDropdown() {
    if (fecharAfiliadosTimerRef.current) clearTimeout(fecharAfiliadosTimerRef.current);
    setAfiliadosAberto(true);
  }

  function fecharAfiliadosComDelay() {
    fecharAfiliadosTimerRef.current = setTimeout(() => setAfiliadosAberto(false), 200);
  }

  return (
    <nav className="w-full bg-[#0E1117]/90 backdrop-blur-md border-b border-white/8 z-40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="font-bebas text-2xl tracking-[0.2em] text-white hover:text-white/80 transition shrink-0">
          CAVALHEIRO
        </Link>

        {/* Links desktop */}
        <div className="hidden lg:flex items-center gap-0.5 flex-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                l.href === "/"
                  ? pathname === "/" || pathname.startsWith("/varejo")
                    ? "text-white"
                    : "text-white/50 hover:text-white/80"
                  : pathname.startsWith(l.href)
                  ? "text-white"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {l.label}
            </Link>
          ))}

          {/* Dropdown Revendedores */}
          <div
            className="relative"
            onMouseEnter={abrirDropdown}
            onMouseLeave={fecharDropdownComDelay}
          >
            {/* Clique vai para a página /revendedores; hover mostra o dropdown */}
            <Link
              href="/revendedores"
              className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition ${
                revendedoresAtivo ? "text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              Revendedores
              <ChevronDown
                size={13}
                className={`transition-transform ${revendedoresAberto ? "rotate-180" : ""}`}
              />
            </Link>

            {revendedoresAberto && (
              <div
                className="absolute left-0 top-full bg-[#161B22] border border-white/10 rounded-xl shadow-2xl overflow-hidden w-64 z-50"
                onMouseEnter={abrirDropdown}
                onMouseLeave={fecharDropdownComDelay}
              >
                <div className="absolute -top-2 left-0 right-0 h-2" />
                {REVENDEDORES.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    onClick={() => setRevendedoresAberto(false)}
                    className="flex items-start gap-3 px-4 py-4 hover:bg-white/5 transition"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                      style={{ backgroundColor: c.color }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-white leading-tight">{c.label}</p>
                      <p className="text-xs text-white/40 mt-0.5">{c.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Dropdown Afiliados */}
          <div
            className="relative"
            onMouseEnter={abrirAfiliadosDropdown}
            onMouseLeave={fecharAfiliadosComDelay}
          >
            <Link
              href="/afiliados"
              className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition ${
                afiliadosAtivo ? "text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              Afiliados
              <ChevronDown
                size={13}
                className={`transition-transform ${afiliadosAberto ? "rotate-180" : ""}`}
              />
            </Link>

            {afiliadosAberto && (
              <div
                className="absolute left-0 top-full bg-[#161B22] border border-white/10 rounded-xl shadow-2xl overflow-hidden w-64 z-50"
                onMouseEnter={abrirAfiliadosDropdown}
                onMouseLeave={fecharAfiliadosComDelay}
              >
                <div className="absolute -top-2 left-0 right-0 h-2" />
                {AFILIADOS_NAV.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    onClick={() => setAfiliadosAberto(false)}
                    className="flex items-start gap-3 px-4 py-4 hover:bg-white/5 transition"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                      style={{ backgroundColor: c.color }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-white leading-tight">{c.label}</p>
                      <p className="text-xs text-white/40 mt-0.5">{c.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hamburguer mobile */}
        <button
          className="lg:hidden text-white/70 hover:text-white transition ml-auto"
          onClick={() => setMenuAberto((v) => !v)}
          aria-label="Menu"
        >
          {menuAberto ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Menu mobile */}
      {menuAberto && (
        <div className="lg:hidden bg-[#0E1117] border-t border-white/8 px-4 pb-4 pt-2 flex flex-col gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuAberto(false)}
              className={`px-3 py-2.5 text-sm font-medium rounded-md transition ${
                pathname.startsWith(l.href) && l.href !== "/"
                  ? "text-white bg-white/10"
                  : l.href === "/" && (pathname === "/" || pathname.startsWith("/varejo"))
                  ? "text-white bg-white/10"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {l.label}
            </Link>
          ))}

          <div className="mt-2 pt-2 border-t border-white/10">
            <Link
              href="/revendedores"
              onClick={() => setMenuAberto(false)}
              className="block px-3 py-2 text-sm font-medium text-white/70 hover:text-white transition"
            >
              Revendedores
            </Link>
            {REVENDEDORES.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                onClick={() => setMenuAberto(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-white/5 transition ml-2"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: c.color }}
                />
                <div>
                  <span className="text-sm font-medium text-white block">{c.label}</span>
                  <span className="text-xs text-white/30">{c.desc}</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10">
            <Link
              href="/afiliados"
              onClick={() => setMenuAberto(false)}
              className="block px-3 py-2 text-sm font-medium text-white/70 hover:text-white transition"
            >
              Afiliados
            </Link>
            {AFILIADOS_NAV.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                onClick={() => setMenuAberto(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-white/5 transition ml-2"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: c.color }}
                />
                <div>
                  <span className="text-sm font-medium text-white block">{c.label}</span>
                  <span className="text-xs text-white/30">{c.desc}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
