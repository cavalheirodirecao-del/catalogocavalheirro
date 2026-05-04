"use client";

import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  fotos: string[];
  idx: number;
  onClose: () => void;
  onChange: (idx: number) => void;
}

export default function Lightbox({ fotos, idx, onClose, onChange }: Props) {
  const prev = useCallback(() => onChange((idx - 1 + fotos.length) % fotos.length), [idx, fotos.length, onChange]);
  const next = useCallback(() => onChange((idx + 1) % fotos.length), [idx, fotos.length, onChange]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  // Touch swipe
  let touchStartX = 0;
  function onTouchStart(e: React.TouchEvent) {
    touchStartX = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (dx > 50) prev();
    else if (dx < -50) next();
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Fechar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition z-10"
      >
        <X size={20} />
      </button>

      {/* Contador */}
      {fotos.length > 1 && (
        <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm tabular-nums">
          {idx + 1} / {fotos.length}
        </span>
      )}

      {/* Seta esquerda */}
      {fotos.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); prev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Imagem */}
      <img
        src={fotos[idx]}
        alt=""
        className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
        onClick={e => e.stopPropagation()}
      />

      {/* Seta direita */}
      {fotos.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); next(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
        >
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  );
}
