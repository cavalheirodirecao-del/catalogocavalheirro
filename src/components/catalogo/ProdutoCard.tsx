"use client";

import { useState } from "react";
import { ShoppingCart, Play, Lock } from "lucide-react";
import { formatarMoeda } from "@/lib/utils";
import Link from "next/link";

interface Variante {
  id: string;
  gradeItem: { valor: string; ordem: number };
  estoque: { quantidade: number; pendente: number } | null;
}

interface Cor {
  id: string;
  nome: string;
  hexCor: string | null;
  imagens: { url: string; principal: boolean; ordem: number }[];
  variantes: Variante[];
}

interface ProdutoCardProps {
  produto: {
    id: string;
    codigo: string;
    nome: string;
    descricao: string | null;
    videoUrl: string | null;
    precoVista: number;
    precoPrazo: number;
    cores: Cor[];
    imagemPrincipalOverride?: string | null;
  };
  catalogo?: string;
  pathCatalogo?: string;
  precoVisivel?: boolean;
  onVerPreco?: () => void;
  onAdicionarCarrinho: (item: {
    varianteId: string;
    produtoId: string;
    produtoNome: string;
    corId: string;
    corNome: string;
    tamanho: string;
    imagemUrl: string;
    quantidade: number;
    precoUnitario: number;
  }) => void;
}

const IMG_PADRAO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='14' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ESem foto%3C/text%3E%3C/svg%3E";

// ── Temas por catálogo ─────────────────────────────────────
const CARD_TEMA = {
  VAREJO: {
    card: "bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group",
    imgBg: "bg-gray-100",
    codClass: "text-xs text-gray-400 font-mono",
    nameClass: "font-semibold text-sm text-gray-900 mt-0.5 leading-tight",
    priceClass: "text-base font-bold text-gray-900",
    subPriceClass: "text-xs text-gray-400",
    footerClass: "text-xs text-gray-400 mt-2",
    ctaClass: "bg-black text-white hover:bg-gray-800",
    ctaDisabled: "disabled:opacity-40 disabled:cursor-not-allowed",
    sizeActive: "bg-black text-white border-black",
    sizeInactive: "border-gray-200 hover:border-gray-400 text-gray-700",
    colorActive: "border-black scale-110",
    colorInactive: "border-gray-200 hover:border-gray-400",
    noStock: "text-xs text-red-400 mt-3",
    innerPad: "p-3",
  },
  ATACADO: {
    card: "bg-white overflow-hidden border border-[#D5C9B5] hover:border-[#B8965A] transition-colors duration-200 group",
    imgBg: "bg-[#F4EFE6]",
    codClass: "text-[10px] text-[#B8965A] font-mono tracking-widest uppercase",
    nameClass: "font-cormorant font-semibold text-base text-[#1A1714] mt-0.5 leading-tight",
    priceClass: "font-cormorant text-lg font-semibold text-[#1A1714]",
    subPriceClass: "text-xs text-[#B8965A]",
    footerClass: "text-xs text-[#B8965A] mt-2 font-cormorant",
    ctaClass: "bg-[#1A1714] text-[#B8965A] hover:bg-[#B8965A] hover:text-white",
    ctaDisabled: "disabled:opacity-40 disabled:cursor-not-allowed",
    sizeActive: "bg-[#1A1714] text-[#B8965A] border-[#1A1714]",
    sizeInactive: "border-[#D5C9B5] hover:border-[#B8965A] text-[#1A1714]",
    colorActive: "border-[#B8965A] scale-110",
    colorInactive: "border-[#D5C9B5] hover:border-[#B8965A]",
    noStock: "text-xs text-[#B8965A]/60 mt-3",
    innerPad: "p-3",
  },
  FABRICA: {
    card: "bg-[#161B22] overflow-hidden border border-[#F5C400]/15 hover:border-[#F5C400]/50 transition-colors duration-200 group",
    imgBg: "bg-[#0E1117]",
    codClass: "text-[10px] text-[#F5C400] font-space-mono tracking-widest",
    nameClass: "font-semibold text-sm text-white mt-0.5 leading-tight",
    priceClass: "font-bebas text-xl tracking-wider text-[#F5C400]",
    subPriceClass: "text-xs text-[#F5C400]/40 font-space-mono",
    footerClass: "text-xs text-[#F5C400]/40 mt-2 font-space-mono",
    ctaClass: "bg-[#F5C400] text-[#0E1117] hover:bg-yellow-300 font-bold",
    ctaDisabled: "disabled:opacity-30 disabled:cursor-not-allowed",
    sizeActive: "bg-[#F5C400] text-[#0E1117] border-[#F5C400] font-bold",
    sizeInactive: "border-[#F5C400]/20 hover:border-[#F5C400]/60 text-[#F5C400]/60",
    colorActive: "border-[#F5C400] scale-110",
    colorInactive: "border-[#F5C400]/20 hover:border-[#F5C400]/50",
    noStock: "text-xs text-[#F5C400]/30 mt-3 font-space-mono",
    innerPad: "p-3",
  },
} as const;

type CatalogoKey = keyof typeof CARD_TEMA;

function getTema(catalogo?: string) {
  if (catalogo === "ATACADO") return CARD_TEMA.ATACADO;
  if (catalogo === "FABRICA") return CARD_TEMA.FABRICA;
  return CARD_TEMA.VAREJO;
}

export default function ProdutoCard({ produto, catalogo, pathCatalogo, precoVisivel = true, onVerPreco, onAdicionarCarrinho }: ProdutoCardProps) {
  const [corSelecionada, setCorSelecionada] = useState<Cor | null>(produto.cores[0] ?? null);
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState<Variante | null>(null);
  const [mostrarVideo, setMostrarVideo] = useState(false);
  const t = getTema(catalogo);

  // Foto da cor selecionada, com fallback para imagemPrincipal do produto
  const imagemDaCor = corSelecionada
    ? (corSelecionada.imagens.find((i) => i.principal)?.url ??
       corSelecionada.imagens.sort((a, b) => a.ordem - b.ordem)[0]?.url ??
       null)
    : null;
  const imagem = imagemDaCor ?? produto.imagemPrincipalOverride ?? null;

  const isGrade = catalogo === "ATACADO" || catalogo === "FABRICA";
  const isLink = isGrade || catalogo === "VAREJO";

  if (isLink && pathCatalogo) {
    return (
      <Link href={`/${pathCatalogo}/produto/${produto.id}`} className={`block ${t.card}`}>
        <div className={`aspect-[3/4] ${t.imgBg} overflow-hidden relative`}>
          <img
            src={imagem ?? IMG_PADRAO}
            alt={produto.nome}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          {produto.cores.length > 1 && (
            <div className="absolute bottom-2 left-2 flex gap-1">
              {produto.cores.slice(0, 5).map((cor) => (
                <span
                  key={cor.id}
                  className="w-4 h-4 rounded-full border border-white shadow"
                  style={{ backgroundColor: cor.hexCor ?? "#ccc" }}
                />
              ))}
              {produto.cores.length > 5 && (
                <span className="text-xs text-white bg-black/50 rounded-full px-1">+{produto.cores.length - 5}</span>
              )}
            </div>
          )}
        </div>
        <div className={t.innerPad}>
          <p className={t.codClass}>{produto.codigo}</p>
          <p className={t.nameClass}>{produto.nome}</p>
          <div className="mt-2">
            {precoVisivel ? (
              <>
                <p className={t.priceClass}>{formatarMoeda(produto.precoVista)}</p>
                <p className={t.subPriceClass}>{formatarMoeda(produto.precoPrazo)} a prazo</p>
              </>
            ) : (
              <button
                onClick={(e) => { e.preventDefault(); onVerPreco?.(); }}
                className="flex items-center gap-1.5 mt-1 text-xs text-gray-400 hover:text-gray-600 transition"
              >
                <Lock size={11} />
                Ver preço
              </button>
            )}
          </div>
          <p className={t.footerClass}>{produto.cores.length} {produto.cores.length === 1 ? "cor" : "cores"} · Ver grade →</p>
        </div>
      </Link>
    );
  }

  // Modo varejo inline
  const variantesDisponiveis = corSelecionada?.variantes
    .filter((v) => Math.max(0, (v.estoque?.quantidade ?? 0) - (v.estoque?.pendente ?? 0)) > 0)
    .sort((a, b) => a.gradeItem.ordem - b.gradeItem.ordem) ?? [];

  function handleSelectCor(cor: Cor) {
    setCorSelecionada(cor);
    setTamanhoSelecionado(null);
  }

  function handleAdicionar() {
    if (!corSelecionada || !tamanhoSelecionado) return;
    onAdicionarCarrinho({
      varianteId: tamanhoSelecionado.id,
      produtoId: produto.id,
      produtoNome: produto.nome,
      corId: corSelecionada.id,
      corNome: corSelecionada.nome,
      tamanho: tamanhoSelecionado.gradeItem.valor,
      imagemUrl: imagem ?? IMG_PADRAO,
      quantidade: 1,
      precoUnitario: produto.precoVista,
    });
    setTamanhoSelecionado(null);
  }

  function getYouTubeId(url: string): string | null {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:shorts\/|embed\/|watch\?v=))([a-zA-Z0-9_-]{11})/);
    return match?.[1] ?? null;
  }

  const youtubeId = produto.videoUrl ? getYouTubeId(produto.videoUrl) : null;

  return (
    <div className={`${t.card} flex flex-col`}>
      <div className={`aspect-[3/4] ${t.imgBg} overflow-hidden relative`}>
        {mostrarVideo && youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&controls=1`}
            className="w-full h-full"
            allow="autoplay"
            allowFullScreen
          />
        ) : (
          <>
            <img
              src={imagem ?? IMG_PADRAO}
              alt={produto.nome}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            {youtubeId && !mostrarVideo && (
              <button
                onClick={() => setMostrarVideo(true)}
                className="absolute bottom-2 right-2 bg-black/70 text-white rounded-full p-2 hover:bg-black transition"
                title="Ver vídeo"
              >
                <Play size={14} fill="white" />
              </button>
            )}
          </>
        )}
        {mostrarVideo && (
          <button
            onClick={() => setMostrarVideo(false)}
            className="absolute top-2 right-2 bg-black/70 text-white rounded-full px-2 py-0.5 text-xs"
          >
            ✕ Foto
          </button>
        )}
      </div>

      <div className={`${t.innerPad} flex flex-col flex-1`}>
        <p className={t.codClass}>{produto.codigo}</p>
        <p className={t.nameClass}>{produto.nome}</p>

        <div className="mt-2">
          {precoVisivel ? (
            <>
              <p className={t.priceClass}>{formatarMoeda(produto.precoVista)}</p>
              <p className={t.subPriceClass}>{formatarMoeda(produto.precoPrazo)} a prazo</p>
            </>
          ) : (
            <button
              onClick={onVerPreco}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition"
            >
              <Lock size={11} />
              Ver preço
            </button>
          )}
        </div>

        {produto.cores.length > 0 && (
          <div className="mt-3">
            <p className={`text-xs mb-1 ${t.subPriceClass}`}>
              Cor: <span className="font-medium">{corSelecionada?.nome}</span>
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {produto.cores.map((cor) => (
                <button
                  key={cor.id}
                  onClick={() => handleSelectCor(cor)}
                  title={cor.nome}
                  className={`w-6 h-6 rounded-full border-2 transition ${
                    corSelecionada?.id === cor.id ? t.colorActive : t.colorInactive
                  }`}
                  style={{ backgroundColor: cor.hexCor ?? "#cccccc" }}
                />
              ))}
            </div>
          </div>
        )}

        {variantesDisponiveis.length > 0 && (
          <div className="mt-3">
            <p className={`text-xs mb-1 ${t.subPriceClass}`}>Tamanho:</p>
            <div className="flex gap-1 flex-wrap">
              {variantesDisponiveis.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setTamanhoSelecionado(v)}
                  className={`px-2 py-1 rounded text-xs border transition ${
                    tamanhoSelecionado?.id === v.id ? t.sizeActive : t.sizeInactive
                  }`}
                >
                  {v.gradeItem.valor}
                </button>
              ))}
            </div>
          </div>
        )}

        {variantesDisponiveis.length === 0 && (
          <p className={t.noStock}>Sem estoque nesta cor</p>
        )}

        <button
          onClick={handleAdicionar}
          disabled={!tamanhoSelecionado}
          className={`mt-auto pt-3 w-full flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition ${t.ctaClass} ${t.ctaDisabled}`}
        >
          <ShoppingCart size={14} />
          {tamanhoSelecionado ? "Adicionar" : "Selecione um tamanho"}
        </button>
      </div>
    </div>
  );
}
