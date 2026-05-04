"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function AnuncioBar() {
  const [texto, setTexto] = useState<string | null>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("anuncio_dismissed")) return;
    fetch("/api/configuracoes")
      .then(r => r.json())
      .then(data => {
        if (data?.anuncioBarAtivo && data?.anuncioBarTexto) {
          setTexto(data.anuncioBarTexto);
          setVisivel(true);
        }
      })
      .catch(() => {});
  }, []);

  if (!visivel || !texto) return null;

  return (
    <div className="bg-[#0A0A0A] text-white py-2.5 px-4 relative overflow-hidden">
      {/* Linha dourada sutil na base */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#B8954A]/40 to-transparent" />
      <p className="text-center text-xs tracking-widest text-white/70 uppercase pr-8">{texto}</p>
      <button
        onClick={() => {
          sessionStorage.setItem("anuncio_dismissed", "1");
          setVisivel(false);
        }}
        aria-label="Fechar"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition"
      >
        <X size={13} />
      </button>
    </div>
  );
}
