"use client";

import { useState } from "react";
import Lightbox from "@/components/catalogo/Lightbox";

interface ProdutoLookbook {
  id: string;
  nome: string;
  grupo: { nome: string } | null;
  precoVarejoVista: number;
  precoAtacadoVista: number;
  precoFabricaVista: number;
  img: string | null;
}

interface Props {
  produtos: ProdutoLookbook[];
}

const FILTROS = [
  { key: "TODOS", label: "Todos" },
  { key: "VAREJO", label: "Varejo" },
  { key: "ATACADO", label: "Atacado" },
  { key: "FABRICA", label: "Fábrica" },
] as const;

type FiltroKey = (typeof FILTROS)[number]["key"];

const IMG_PADRAO =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect width='400' height='500' fill='%23111'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='14' fill='%23444' text-anchor='middle' dy='.3em'%3ESem foto%3C/text%3E%3C/svg%3E";

export default function LookbookClient({ produtos }: Props) {
  const [filtro, setFiltro] = useState<FiltroKey>("TODOS");
  const [lightboxFotos, setLightboxFotos] = useState<string[]>([]);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  // Filtra por "catálogo" com base nos preços (tem preço = está disponível)
  const produtosFiltrados = produtos.filter((p) => {
    if (filtro === "TODOS") return true;
    if (filtro === "VAREJO") return Number(p.precoVarejoVista) > 0;
    if (filtro === "ATACADO") return Number(p.precoAtacadoVista) > 0;
    if (filtro === "FABRICA") return Number(p.precoFabricaVista) > 0;
    return true;
  });

  function abrirLightbox(idx: number) {
    const fotos = produtosFiltrados.map((p) => p.img ?? IMG_PADRAO);
    setLightboxFotos(fotos);
    setLightboxIdx(idx);
  }

  return (
    <>
      {/* Filtros */}
      <div className="sticky top-16 z-20 bg-[#0E1117]/90 backdrop-blur-md border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="font-space-mono text-xs text-white/30 tracking-widest uppercase shrink-0 mr-2">
            Filtrar:
          </span>
          {FILTROS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`shrink-0 font-dm-sans text-sm font-medium px-4 py-1.5 rounded-full transition ${
                filtro === f.key
                  ? "bg-white text-[#0E1117]"
                  : "text-white/50 hover:text-white/80 hover:bg-white/8"
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto font-space-mono text-xs text-white/20 shrink-0">
            {produtosFiltrados.length} peças
          </span>
        </div>
      </div>

      {/* Grid Masonry-like com CSS columns */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        {produtosFiltrados.length === 0 ? (
          <div className="text-center py-24 text-white/30">
            <p className="font-bebas text-4xl tracking-wider">NENHUM PRODUTO</p>
            <button
              onClick={() => setFiltro("TODOS")}
              className="mt-4 text-sm font-dm-sans underline text-white/40 hover:text-white/60 transition"
            >
              Limpar filtro
            </button>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4">
            {produtosFiltrados.map((produto, i) => (
              <div
                key={produto.id}
                className="break-inside-avoid mb-3 sm:mb-4 group cursor-pointer relative overflow-hidden rounded-xl bg-[#161B22]"
                onClick={() => abrirLightbox(i)}
              >
                <img
                  src={produto.img ?? IMG_PADRAO}
                  alt={produto.nome}
                  className="w-full h-auto block group-hover:scale-105 transition duration-500"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition duration-300 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100">
                  <p className="text-white font-dm-sans font-semibold text-sm leading-tight">{produto.nome}</p>
                  {produto.grupo && (
                    <p className="text-white/50 font-space-mono text-[10px] tracking-wider mt-0.5 uppercase">
                      {produto.grupo.nome}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxFotos.length > 0 && (
        <Lightbox
          fotos={lightboxFotos}
          idx={lightboxIdx}
          onClose={() => setLightboxFotos([])}
          onChange={setLightboxIdx}
        />
      )}
    </>
  );
}
