"use client";

import { useState, useMemo, useRef } from "react";
import { ShoppingCart, X, Minus, Plus, Search, ChevronDown, Menu } from "lucide-react";
import { useCart, CartProvider } from "./CartProvider";
import ProdutoCard from "./ProdutoCard";
import { formatarMoeda, getPreco } from "@/lib/utils";
import Link from "next/link";
import { TipoCatalogo } from "@prisma/client";
import RegistroWall from "./RegistroWall";
import StickyLeadBar from "./StickyLeadBar";
import MiniGrade from "./MiniGrade";

interface Produto {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  videoUrl: string | null;
  imagemPrincipal?: string | null;
  grupo: { id: string; nome: string } | null;
  subGrupo: { id: string; nome: string } | null;
  novidade: boolean;
  oferta: boolean;
  precoVarejoVista: any;
  precoVarejoPrazo: any;
  precoAtacadoVista: any;
  precoAtacadoPrazo: any;
  precoFabricaVista: any;
  precoFabricaPrazo: any;
  cores: {
    id: string;
    nome: string;
    hexCor: string | null;
    imagens: { url: string; principal: boolean; ordem: number }[];
    variantes: {
      id: string;
      gradeItem: { id: string; valor: string; ordem: number };
      estoque: { quantidade: number; pendente?: number } | null;
    }[];
  }[];
}

interface Banner {
  id: string;
  imagemDesktop: string | null;
  imagemTablet: string | null;
  imagemMobile: string | null;
  videoUrl: string | null;
  titulo: string | null;
  subtitulo: string | null;
  linkUrl: string | null;
}

interface GrupoNav {
  id: string;
  nome: string;
  bannerUrl: string | null;
  imagemUrl: string | null;
}

interface Props {
  produtos: Produto[];
  catalogo: TipoCatalogo;
  vendedorSlug: string | null;
  banners: Banner[];
  config: { titulo: string; corPrimaria: string | null } | null;
  vendedorNome: string | null;
  qtdMinima: number;
  pathCatalogo: string;
  grupos: GrupoNav[];
}

const IMG_PADRAO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='14' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ESem foto%3C/text%3E%3C/svg%3E";

const LABEL_CATALOGO: Record<TipoCatalogo, string> = { VAREJO: "Varejo", ATACADO: "Atacado Revenda", FABRICA: "Atacado +40 pças" };

const TEMA = {
  VAREJO: {
    pageBg: "bg-[#F8F8F6] font-dm-sans",
    header: "bg-[#1C1C1A] text-white",
    headerBorder: "border-white/10",
    logoClass: "font-dm-sans font-black text-base",
    logoLabel: "text-xs text-white/50 leading-tight font-dm-sans",
    searchWrap: "bg-white/10",
    searchInput: "text-white placeholder-white/40",
    searchIcon: "text-white/50",
    catActive: "border-[#FF4D00] text-white",
    catInactive: "border-transparent text-white/50 hover:text-white/80",
    mobileBar: "bg-white border-b border-gray-100",
    mobileSearch: "bg-white border border-gray-200",
    mobileSearchInput: "text-gray-700 placeholder-gray-400",
    countText: "text-gray-400",
    countNumber: "text-gray-700",
    emptyIcon: "🔍",
    cartBg: "bg-[#FF4D00]",
    cartText: "text-white",
    dropdownBg: "bg-[#1C1C1A]",
    dropdownBorder: "border-white/10",
    dropdownItem: "text-white/70 hover:text-white hover:bg-white/10 transition",
    dropdownItemActive: "text-white font-medium bg-white/15",
  },
  ATACADO: {
    pageBg: "bg-[#F4EFE6] font-dm-sans",
    header: "bg-[#F4EFE6] text-[#1A1714]",
    headerBorder: "border-[#B8965A]/30",
    logoClass: "font-cormorant italic font-semibold text-xl leading-none",
    logoLabel: "text-xs text-[#B8965A] leading-tight font-cormorant tracking-widest uppercase",
    searchWrap: "bg-[#1A1714]/8 border border-[#B8965A]/20",
    searchInput: "text-[#1A1714] placeholder-[#1A1714]/40",
    searchIcon: "text-[#B8965A]",
    catActive: "border-[#B8965A] text-[#1A1714] font-medium",
    catInactive: "border-transparent text-[#1A1714]/50 hover:text-[#1A1714]/80",
    mobileBar: "bg-[#EDE7DA] border-b border-[#B8965A]/20",
    mobileSearch: "bg-[#F4EFE6] border border-[#B8965A]/30",
    mobileSearchInput: "text-[#1A1714] placeholder-[#1A1714]/40",
    countText: "text-[#1A1714]/50 font-cormorant",
    countNumber: "text-[#1A1714] font-cormorant font-medium",
    emptyIcon: "◇",
    cartBg: "bg-[#1A1714]",
    cartText: "text-[#B8965A]",
    dropdownBg: "bg-[#FDFAF4]",
    dropdownBorder: "border-[#B8965A]/25",
    dropdownItem: "text-[#1A1714]/60 hover:text-[#1A1714] hover:bg-[#1A1714]/5 transition",
    dropdownItemActive: "text-[#1A1714] font-medium bg-[#1A1714]/8",
  },
  FABRICA: {
    pageBg: "bg-[#0E1117] font-space-mono",
    header: "bg-[#0E1117] text-[#F5C400]",
    headerBorder: "border-[#F5C400]/15",
    logoClass: "font-bebas text-2xl tracking-widest leading-none",
    logoLabel: "text-xs text-[#F5C400]/50 leading-tight font-space-mono tracking-widest uppercase",
    searchWrap: "bg-[#F5C400]/5 border border-[#F5C400]/15",
    searchInput: "text-[#F5C400] placeholder-[#F5C400]/30",
    searchIcon: "text-[#F5C400]/40",
    catActive: "border-[#F5C400] text-[#F5C400]",
    catInactive: "border-transparent text-[#F5C400]/35 hover:text-[#F5C400]/65",
    mobileBar: "bg-[#0E1117] border-b border-[#F5C400]/10",
    mobileSearch: "bg-[#161B22] border border-[#F5C400]/20",
    mobileSearchInput: "text-[#F5C400] placeholder-[#F5C400]/30",
    countText: "text-[#F5C400]/40 font-space-mono text-xs",
    countNumber: "text-[#F5C400] font-space-mono",
    emptyIcon: "◈",
    cartBg: "bg-[#F5C400]",
    cartText: "text-[#0E1117]",
    dropdownBg: "bg-[#161B22]",
    dropdownBorder: "border-[#F5C400]/15",
    dropdownItem: "text-[#F5C400]/50 hover:text-[#F5C400] hover:bg-[#F5C400]/5 transition",
    dropdownItemActive: "text-[#F5C400] font-medium bg-[#F5C400]/10",
  },
} as const;

type FiltroAtivo =
  | { tipo: "todos" }
  | { tipo: "novidades" }
  | { tipo: "ofertas" }
  | { tipo: "grupo"; grupoId: string }
  | { tipo: "subgrupo"; grupoId: string; subGrupoId: string };

function getYoutubeEmbedUrl(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1&mute=1&loop=1&playlist=${m[1]}&controls=0` : null;
}

// ─── Carrinho Drawer ──────────────────────────────────────
function CarrinhoDrawer({ catalogo, produtos, precos, qtdMinima, vendedorSlug }: {
  catalogo: TipoCatalogo;
  produtos: Produto[];
  precos: Record<string, number>;
  qtdMinima: number;
  vendedorSlug: string | null;
}) {
  const { itens, remover, alterarQtd, totalItens, totalValor } = useCart();
  const [aberto, setAberto] = useState(false);
  const [expandidoProdutoId, setExpandidoProdutoId] = useState<string | null>(null);

  const total = totalValor(precos);
  const totalQtd = itens.reduce((acc, i) => acc + i.quantidade, 0);
  const atingiuMinimo = catalogo === "VAREJO" || totalQtd >= qtdMinima;
  const isGrade = catalogo === "ATACADO" || catalogo === "FABRICA";

  const itensPorProduto = useMemo(() => {
    const map = new Map<string, typeof itens>();
    for (const item of itens) {
      if (!map.has(item.produtoId)) map.set(item.produtoId, []);
      map.get(item.produtoId)!.push(item);
    }
    return map;
  }, [itens]);

  return (
    <>
      <button onClick={() => setAberto(true)} className="relative">
        <ShoppingCart size={22} />
        {totalItens > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
            {totalItens}
          </span>
        )}
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAberto(false)} />
          <div className="relative bg-white w-full max-w-sm h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold text-lg">Meu Pedido</h2>
              <button onClick={() => setAberto(false)}><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4">
              {itens.length === 0 && (
                <p className="text-gray-400 text-sm text-center mt-8">Nenhum item adicionado.</p>
              )}

              {isGrade ? (
                Array.from(itensPorProduto.entries()).map(([produtoId, prodItens]) => {
                  const prodData = produtos.find(p => p.id === produtoId);
                  const subtotalProd = prodItens.reduce((s, i) => s + (precos[i.varianteId] ?? 0) * i.quantidade, 0);
                  const isExpandido = expandidoProdutoId === produtoId;

                  return (
                    <div key={produtoId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{prodItens[0].produtoNome}</p>
                        <p className="text-xs font-bold text-gray-700 ml-2 shrink-0">{formatarMoeda(subtotalProd)}</p>
                      </div>

                      {prodItens.map((item) => (
                        <div key={item.varianteId} className="flex gap-2.5 pl-2">
                          <img src={item.imagemUrl} alt={item.produtoNome} className="w-12 h-12 object-cover rounded-lg bg-gray-100 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500">{item.tamanho} · {item.corNome}</p>
                            <p className="text-xs font-semibold mt-0.5">{formatarMoeda((precos[item.varianteId] ?? 0) * item.quantidade)}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <button onClick={() => alterarQtd(item.varianteId, item.quantidade - 1)} className="w-5 h-5 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-100"><Minus size={8} /></button>
                              <span className="text-xs font-medium w-5 text-center">{item.quantidade}</span>
                              <button onClick={() => alterarQtd(item.varianteId, item.quantidade + 1)} className="w-5 h-5 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-100"><Plus size={8} /></button>
                              <button onClick={() => remover(item.varianteId)} className="ml-auto text-red-400 hover:text-red-600"><X size={12} /></button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {prodData && (
                        <div>
                          <button
                            onClick={() => setExpandidoProdutoId(isExpandido ? null : produtoId)}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition pl-2"
                          >
                            <ChevronDown size={12} className={`transition-transform ${isExpandido ? "rotate-180" : ""}`} />
                            {isExpandido ? "Fechar" : "＋ Adicionar variante"}
                          </button>
                          {isExpandido && (
                            <div className="mt-2">
                              <MiniGrade
                                produto={{
                                  id: prodData.id,
                                  nome: prodData.nome,
                                  imagemPrincipal: prodData.imagemPrincipal,
                                  precoVista: getPreco(prodData, catalogo, "VISTA"),
                                  precoPrazo: getPreco(prodData, catalogo, "PRAZO"),
                                  cores: prodData.cores as any,
                                }}
                                onConcluir={() => setExpandidoProdutoId(null)}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      <div className="border-t border-gray-100" />
                    </div>
                  );
                })
              ) : (
                itens.map((item) => (
                  <div key={item.varianteId} className="flex gap-3">
                    <img src={item.imagemUrl} alt={item.produtoNome} className="w-16 h-16 object-cover rounded-lg bg-gray-100" />
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-tight">{item.produtoNome}</p>
                      <p className="text-xs text-gray-400">{item.tamanho} · {item.corNome}</p>
                      <p className="text-sm font-bold mt-1">{formatarMoeda((precos[item.varianteId] ?? 0) * item.quantidade)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button onClick={() => alterarQtd(item.varianteId, item.quantidade - 1)} className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-100"><Minus size={10} /></button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantidade}</span>
                        <button onClick={() => alterarQtd(item.varianteId, item.quantidade + 1)} className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-100"><Plus size={10} /></button>
                        <button onClick={() => remover(item.varianteId)} className="ml-auto text-red-400 hover:text-red-600"><X size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t space-y-3">
              {catalogo !== "VAREJO" && (
                <div className={`text-xs rounded-lg px-3 py-2 ${atingiuMinimo ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                  {atingiuMinimo ? `✓ Mínimo atingido (${totalQtd} peças)` : `Mínimo: ${qtdMinima} peças — faltam ${qtdMinima - totalQtd}`}
                </div>
              )}
              <div className="flex justify-between font-bold text-base">
                <span>Total</span><span>{formatarMoeda(total)}</span>
              </div>
              <Link
                href={`/checkout?catalogo=${catalogo}${vendedorSlug ? `&vendedor=${vendedorSlug}` : ""}`}
                onClick={() => setAberto(false)}
                className={`block w-full text-center bg-black text-white rounded-lg py-3 text-sm font-semibold transition ${!atingiuMinimo || itens.length === 0 ? "opacity-40 pointer-events-none" : "hover:bg-gray-800"}`}
              >
                Finalizar Pedido
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Banners com slider responsivo ───────────────────────
function BannerSlider({ banners }: { banners: Props["banners"] }) {
  const [idx, setIdx] = useState(0);

  if (banners.length === 0) return null;

  const banner = banners[idx];
  const prev = () => setIdx(i => (i - 1 + banners.length) % banners.length);
  const next = () => setIdx(i => (i + 1) % banners.length);

  const imgDesktop = banner.imagemDesktop || banner.imagemTablet || banner.imagemMobile;
  const imgTablet  = banner.imagemTablet  || banner.imagemDesktop || banner.imagemMobile;
  const imgMobile  = banner.imagemMobile  || banner.imagemTablet  || banner.imagemDesktop;

  const embedUrl = banner.videoUrl ? getYoutubeEmbedUrl(banner.videoUrl) : null;

  const content = (
    <div className="relative w-full overflow-hidden bg-black" style={{ maxHeight: 500 }}>
      {embedUrl ? (
        <div className="aspect-video w-full">
          <iframe src={embedUrl} className="w-full h-full" allow="autoplay; muted; loop" allowFullScreen />
        </div>
      ) : (
        <>
          {imgMobile && <img src={imgMobile} alt={banner.titulo ?? ""} className="w-full object-cover block sm:hidden" />}
          {imgTablet && <img src={imgTablet} alt={banner.titulo ?? ""} className="w-full object-cover hidden sm:block lg:hidden" />}
          {imgDesktop && <img src={imgDesktop} alt={banner.titulo ?? ""} className="w-full object-cover hidden lg:block" style={{ maxHeight: 500 }} />}
        </>
      )}
      {(banner.titulo || banner.subtitulo) && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white px-6 py-6">
          {banner.titulo && <p className="text-2xl font-bold">{banner.titulo}</p>}
          {banner.subtitulo && <p className="text-sm text-white/80 mt-1">{banner.subtitulo}</p>}
        </div>
      )}
      {banners.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition" aria-label="Anterior">‹</button>
          <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition" aria-label="Próximo">›</button>
        </>
      )}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`w-2 h-2 rounded-full transition ${i === idx ? "bg-white" : "bg-white/40"}`} />
          ))}
        </div>
      )}
    </div>
  );

  return banner.linkUrl ? <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer">{content}</a> : content;
}

// ─── Banner de categoria ──────────────────────────────────
function CategoryBanner({ grupo, tema }: { grupo: GrupoNav; tema: typeof TEMA[TipoCatalogo] }) {
  if (grupo.bannerUrl) {
    return (
      <div className="relative w-full overflow-hidden bg-black" style={{ maxHeight: 300 }}>
        <img
          src={grupo.bannerUrl}
          alt={grupo.nome}
          className="w-full object-cover"
          style={{ maxHeight: 300 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 px-8 py-6">
          <p className="text-white text-4xl md:text-5xl font-bold leading-tight drop-shadow-lg">{grupo.nome}</p>
        </div>
      </div>
    );
  }
  // Sem banner: header estilizado com o nome da categoria
  return (
    <div className={`w-full px-8 py-10 border-b ${tema.headerBorder} ${tema.header}`}>
      <p className="text-3xl md:text-5xl font-bold">{grupo.nome}</p>
    </div>
  );
}

// ─── Drawer de Categorias ─────────────────────────────────
interface CategoriasDrawerProps {
  aberto: boolean;
  onClose: () => void;
  gruposComSubs: { id: string; nome: string; subs: { id: string; nome: string }[] }[];
  filtro: FiltroAtivo;
  setFiltro: (f: FiltroAtivo) => void;
  tema: typeof TEMA[TipoCatalogo];
  contNovidades: number;
  contOfertas: number;
  totalProdutos: number;
}

function CategoriasDrawer({ aberto, onClose, gruposComSubs, filtro, setFiltro, tema, contNovidades, contOfertas, totalProdutos }: CategoriasDrawerProps) {
  if (!aberto) return null;
  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Painel — full screen no mobile, 300px à esquerda no desktop */}
      <div className={`absolute inset-y-0 left-0 w-full md:w-[300px] ${tema.header} overflow-y-auto flex flex-col`}>
        {/* Header do drawer */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${tema.headerBorder} shrink-0`}>
          <span className="font-semibold text-sm tracking-widest uppercase opacity-60">Categorias</span>
          <button onClick={onClose} className="opacity-60 hover:opacity-100 transition"><X size={18} /></button>
        </div>

        {/* Todos */}
        <button
          onClick={() => { setFiltro({ tipo: "todos" }); onClose(); }}
          className={`w-full px-5 py-4 text-left border-b ${tema.headerBorder} flex justify-between items-center transition
            ${filtro.tipo === "todos" ? "font-semibold opacity-100" : "opacity-60 hover:opacity-100"}`}
        >
          <span>Todos os produtos</span>
          <span className="text-xs opacity-50 tabular-nums">{totalProdutos}</span>
        </button>

        {/* Novidades */}
        {contNovidades > 0 && (
          <button
            onClick={() => { setFiltro({ tipo: "novidades" }); onClose(); }}
            className={`w-full px-5 py-4 text-left border-b ${tema.headerBorder} flex justify-between items-center transition
              ${filtro.tipo === "novidades" ? "font-semibold opacity-100" : "opacity-60 hover:opacity-100"}`}
          >
            <span>Novidades</span>
            <span className="text-xs opacity-50 tabular-nums">{contNovidades}</span>
          </button>
        )}

        {/* Grupos + subgrupos */}
        {gruposComSubs.map(g => {
          const grupoAtivo =
            (filtro.tipo === "grupo" && filtro.grupoId === g.id) ||
            (filtro.tipo === "subgrupo" && filtro.grupoId === g.id);
          return (
            <div key={g.id} className={`border-b ${tema.headerBorder}`}>
              <button
                onClick={() => { setFiltro({ tipo: "grupo", grupoId: g.id }); onClose(); }}
                className={`w-full px-5 py-4 text-left flex justify-between items-center transition
                  ${grupoAtivo ? "font-semibold opacity-100" : "opacity-60 hover:opacity-100"}`}
              >
                <span>{g.nome}</span>
                {g.subs.length > 0 && <span className="text-xs opacity-40">{g.subs.length} tipos</span>}
              </button>
              {g.subs.map(s => {
                const subAtivo = filtro.tipo === "subgrupo" && filtro.subGrupoId === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => { setFiltro({ tipo: "subgrupo", grupoId: g.id, subGrupoId: s.id }); onClose(); }}
                    className={`w-full pl-10 pr-5 py-3 text-left text-sm border-t ${tema.headerBorder} transition
                      ${subAtivo ? "font-semibold opacity-100" : "opacity-50 hover:opacity-80"}`}
                  >
                    {s.nome}
                  </button>
                );
              })}
            </div>
          );
        })}

        {/* Ofertas */}
        {contOfertas > 0 && (
          <button
            onClick={() => { setFiltro({ tipo: "ofertas" }); onClose(); }}
            className={`w-full px-5 py-4 text-left border-b ${tema.headerBorder} flex justify-between items-center transition
              ${filtro.tipo === "ofertas" ? "font-semibold opacity-100" : "opacity-60 hover:opacity-100"}`}
          >
            <span>Ofertas</span>
            <span className="text-xs opacity-50 tabular-nums">{contOfertas}</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Inner ────────────────────────────────────────────────
function CatalogoInner({ produtos, catalogo, banners, config, vendedorNome, qtdMinima, pathCatalogo, vendedorSlug, precoVisivel, onAbrirCadastro, grupos }: Props & { precoVisivel: boolean; onAbrirCadastro: () => void }) {
  const { adicionar } = useCart();
  const [filtro, setFiltro] = useState<FiltroAtivo>({ tipo: "todos" });
  const [busca, setBusca] = useState("");
  const [grupoHover, setGrupoHover] = useState<string | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [grupoMobileAberto, setGrupoMobileAberto] = useState<string | null>(null);
  const [todosHover, setTodosHover] = useState(false);
  const todosTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [menuCategoriasAberto, setMenuCategoriasAberto] = useState(false);
  const tema = TEMA[catalogo];

  // Grupos com seus subgrupos derivados dos produtos
  const gruposComSubs = useMemo(() => {
    const map = new Map<string, { id: string; nome: string; subs: { id: string; nome: string }[] }>();
    for (const p of produtos) {
      if (!p.grupo) continue;
      if (!map.has(p.grupo.id)) map.set(p.grupo.id, { id: p.grupo.id, nome: p.grupo.nome, subs: [] });
      if (p.subGrupo) {
        const g = map.get(p.grupo.id)!;
        if (!g.subs.find(s => s.id === p.subGrupo!.id)) g.subs.push(p.subGrupo!);
      }
    }
    return Array.from(map.values()).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [produtos]);

  const contNovidades = useMemo(() => produtos.filter(p => p.novidade).length, [produtos]);
  const contOfertas   = useMemo(() => produtos.filter(p => p.oferta).length,   [produtos]);

  const produtosFiltrados = useMemo(() => {
    let lista = produtos;
    if (filtro.tipo === "novidades") lista = lista.filter(p => p.novidade);
    else if (filtro.tipo === "ofertas")    lista = lista.filter(p => p.oferta);
    else if (filtro.tipo === "grupo")      lista = lista.filter(p => p.grupo?.id === filtro.grupoId);
    else if (filtro.tipo === "subgrupo")   lista = lista.filter(p => p.grupo?.id === filtro.grupoId && p.subGrupo?.id === filtro.subGrupoId);
    if (busca.trim()) {
      const t = busca.toLowerCase();
      lista = lista.filter(p => p.nome.toLowerCase().includes(t) || p.codigo.toLowerCase().includes(t));
    }
    return lista.map(p => ({
      ...p,
      _precoVista: getPreco(p, catalogo, "VISTA"),
      _precoPrazo: getPreco(p, catalogo, "PRAZO"),
      _imgPrincipal:
        p.imagemPrincipal ||
        p.cores[0]?.imagens.find(i => i.principal)?.url ||
        p.cores[0]?.imagens[0]?.url ||
        null,
    }));
  }, [produtos, filtro, busca, catalogo]);

  const precos = useMemo(() => {
    const map: Record<string, number> = {};
    produtos.forEach((p) => {
      const preco = getPreco(p, catalogo, "VISTA");
      p.cores.forEach((c) => c.variantes.forEach((v) => { map[v.id] = preco; }));
    });
    return map;
  }, [produtos, catalogo]);

  // Label descritivo do filtro ativo
  function getFiltroLabel(): string | null {
    if (filtro.tipo === "novidades") return "Novidades";
    if (filtro.tipo === "ofertas")   return "Ofertas";
    if (filtro.tipo === "grupo") {
      return gruposComSubs.find(g => g.id === filtro.grupoId)?.nome ?? null;
    }
    if (filtro.tipo === "subgrupo") {
      const g = gruposComSubs.find(g => g.id === filtro.grupoId);
      const s = g?.subs.find(s => s.id === filtro.subGrupoId);
      return s ? `${g?.nome} / ${s.nome}` : (g?.nome ?? null);
    }
    return null;
  }

  // Hover handlers (desktop only)
  function entrarGrupo(id: string) {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setGrupoHover(id);
  }
  function sairGrupo() {
    hoverTimerRef.current = setTimeout(() => setGrupoHover(null), 150);
  }

  // Tap handler for mobile group buttons
  function tapGrupo(grupoId: string, temSubs: boolean) {
    if (temSubs) {
      if (grupoMobileAberto === grupoId) {
        setGrupoMobileAberto(null);
      } else {
        setGrupoMobileAberto(grupoId);
        setFiltro({ tipo: "grupo", grupoId });
      }
    } else {
      setFiltro({ tipo: "grupo", grupoId });
      setGrupoMobileAberto(null);
    }
  }

  const grupoMobileData = grupoMobileAberto
    ? gruposComSubs.find(g => g.id === grupoMobileAberto)
    : null;

  const temNav = gruposComSubs.length > 0 || contNovidades > 0 || contOfertas > 0;

  return (
    <div className={`min-h-screen ${tema.pageBg} ${!precoVisivel && catalogo !== "VAREJO" ? "pb-14" : ""}`}>

      {/* ── Header ────────────────────────────────────── */}
      <header className={`${tema.header} sticky top-16 z-30 shadow-sm border-b ${tema.headerBorder}`}>

        {/* Linha principal: logo / busca / carrinho */}
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="shrink-0">
            <p className={tema.logoClass}>{config?.titulo ?? "Cavalheiro"}</p>
            <p className={tema.logoLabel}>{LABEL_CATALOGO[catalogo]}</p>
          </div>

          <div className="flex-1 max-w-md hidden sm:block">
            <div className={`flex items-center ${tema.searchWrap} rounded-full px-3 py-1.5 gap-2`}>
              <Search size={14} className={`${tema.searchIcon} shrink-0`} />
              <input
                type="text"
                value={busca}
                onChange={e => setBusca(e.target.value)}
                placeholder="Buscar produto..."
                className={`bg-transparent text-sm ${tema.searchInput} outline-none w-full`}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {vendedorNome && (
              <p className="text-xs hidden md:block opacity-60">
                Vendedor: <span className="font-semibold opacity-100">{vendedorNome}</span>
              </p>
            )}
            <CarrinhoDrawer catalogo={catalogo} produtos={produtos} precos={precos} qtdMinima={qtdMinima} vendedorSlug={vendedorSlug} />
          </div>
        </div>

        {/* ── Barra de navegação / mega-menu ─────────── */}
        {temNav && (
          <div className={`border-t ${tema.headerBorder}`}>

            {/* Mobile: botão "Categorias" + label do filtro ativo */}
            <div className={`md:hidden flex items-center gap-3 px-4 py-2.5`}>
              <button
                onClick={() => setMenuCategoriasAberto(true)}
                className={`flex items-center gap-2 text-sm border rounded-lg px-3 py-1.5 transition border-current/20 opacity-80 hover:opacity-100`}
              >
                <Menu size={14} />
                Categorias
              </button>
              {filtro.tipo !== "todos" && (
                <span className="text-sm opacity-50 truncate">
                  {filtro.tipo === "novidades" ? "Novidades"
                   : filtro.tipo === "ofertas" ? "Ofertas"
                   : filtro.tipo === "grupo" ? gruposComSubs.find(g => g.id === filtro.grupoId)?.nome
                   : filtro.tipo === "subgrupo"
                     ? `${gruposComSubs.find(g => g.id === filtro.grupoId)?.nome ?? ""} / ${gruposComSubs.find(g => g.id === filtro.grupoId)?.subs.find(s => s.id === filtro.subGrupoId)?.nome ?? ""}`
                     : null}
                </span>
              )}
            </div>

            {/* Desktop: abas scrolláveis + mega-menu hover */}
            <div className="max-w-7xl mx-auto px-4 hidden md:flex gap-0 overflow-x-auto scrollbar-none">

              {/* Todos + mega-menu */}
              <div
                className="relative"
                onMouseEnter={() => { if (todosTimerRef.current) clearTimeout(todosTimerRef.current); setTodosHover(true); }}
                onMouseLeave={() => { todosTimerRef.current = setTimeout(() => setTodosHover(false), 150); }}
              >
                <button
                  onClick={() => { setFiltro({ tipo: "todos" }); setGrupoMobileAberto(null); setTodosHover(false); }}
                  className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition ${filtro.tipo === "todos" ? tema.catActive : tema.catInactive}`}
                >
                  Todos
                </button>
                {todosHover && gruposComSubs.length > 0 && (
                  <div
                    className={`hidden md:block absolute top-full left-0 z-50 min-w-[200px] rounded-b-xl ${tema.dropdownBg} border border-t-0 ${tema.dropdownBorder} shadow-2xl py-1.5`}
                    onMouseEnter={() => { if (todosTimerRef.current) clearTimeout(todosTimerRef.current); setTodosHover(true); }}
                    onMouseLeave={() => { todosTimerRef.current = setTimeout(() => setTodosHover(false), 150); }}
                  >
                    {gruposComSubs.map(g => (
                      <button
                        key={g.id}
                        onClick={() => { setFiltro({ tipo: "grupo", grupoId: g.id }); setTodosHover(false); setGrupoMobileAberto(null); }}
                        className={`w-full text-left px-4 py-2.5 text-sm ${tema.dropdownItem}`}
                      >
                        {g.nome}
                        {g.subs.length > 0 && (
                          <span className="ml-1 text-xs opacity-40">({g.subs.length})</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Novidades */}
              {contNovidades > 0 && (
                <button
                  onClick={() => { setFiltro({ tipo: "novidades" }); setGrupoMobileAberto(null); }}
                  className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition flex items-center gap-1.5 ${filtro.tipo === "novidades" ? tema.catActive : tema.catInactive}`}
                >
                  Novidades
                  <span className="text-xs opacity-60 tabular-nums">({contNovidades})</span>
                </button>
              )}

              {/* Grupos com dropdown */}
              {gruposComSubs.map(g => {
                const isAtivo =
                  (filtro.tipo === "grupo"    && filtro.grupoId === g.id) ||
                  (filtro.tipo === "subgrupo" && filtro.grupoId === g.id);
                return (
                  <div
                    key={g.id}
                    className="relative"
                    onMouseEnter={() => g.subs.length > 0 ? entrarGrupo(g.id) : undefined}
                    onMouseLeave={() => g.subs.length > 0 ? sairGrupo() : undefined}
                  >
                    <button
                      onClick={() => tapGrupo(g.id, g.subs.length > 0)}
                      className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition flex items-center gap-1 ${isAtivo ? tema.catActive : tema.catInactive}`}
                    >
                      {g.nome}
                      {g.subs.length > 0 && (
                        <ChevronDown
                          size={12}
                          className={`transition-transform ${grupoHover === g.id || grupoMobileAberto === g.id ? "rotate-180" : ""}`}
                        />
                      )}
                    </button>

                    {/* Dropdown desktop */}
                    {grupoHover === g.id && g.subs.length > 0 && (
                      <div
                        className={`hidden md:block absolute top-full left-0 z-50 min-w-[200px] rounded-b-xl ${tema.dropdownBg} border border-t-0 ${tema.dropdownBorder} shadow-2xl py-1.5`}
                        onMouseEnter={() => entrarGrupo(g.id)}
                        onMouseLeave={sairGrupo}
                      >
                        {g.subs.map(s => {
                          const subAtivo = filtro.tipo === "subgrupo" && filtro.subGrupoId === s.id;
                          return (
                            <button
                              key={s.id}
                              onClick={() => { setFiltro({ tipo: "subgrupo", grupoId: g.id, subGrupoId: s.id }); setGrupoHover(null); }}
                              className={`w-full text-left px-4 py-2 text-sm rounded-none ${subAtivo ? tema.dropdownItemActive : tema.dropdownItem}`}
                            >
                              {s.nome}
                            </button>
                          );
                        })}
                        <div className={`border-t ${tema.dropdownBorder} mt-1 pt-1`}>
                          <button
                            onClick={() => { setFiltro({ tipo: "grupo", grupoId: g.id }); setGrupoHover(null); }}
                            className={`w-full text-left px-4 py-2 text-xs opacity-60 ${tema.dropdownItem}`}
                          >
                            Ver tudo em {g.nome}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Ofertas */}
              {contOfertas > 0 && (
                <button
                  onClick={() => { setFiltro({ tipo: "ofertas" }); setGrupoMobileAberto(null); }}
                  className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition flex items-center gap-1.5 ${filtro.tipo === "ofertas" ? tema.catActive : tema.catInactive}`}
                >
                  Ofertas
                  <span className="text-xs opacity-60 tabular-nums">({contOfertas})</span>
                </button>
              )}
            </div>

            {/* Sub-strip mobile (apenas quando grupo com subs está aberto) */}
            {grupoMobileData && grupoMobileData.subs.length > 0 && (
              <div className={`md:hidden border-t ${tema.headerBorder} overflow-x-auto scrollbar-none`}>
                <div className="flex gap-0 px-4">
                  <button
                    onClick={() => setFiltro({ tipo: "grupo", grupoId: grupoMobileData.id })}
                    className={`px-3 py-2 text-xs whitespace-nowrap border-b-2 transition ${filtro.tipo === "grupo" && filtro.grupoId === grupoMobileData.id ? tema.catActive : tema.catInactive}`}
                  >
                    Ver tudo
                  </button>
                  {grupoMobileData.subs.map(s => {
                    const subAtivo = filtro.tipo === "subgrupo" && filtro.subGrupoId === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setFiltro({ tipo: "subgrupo", grupoId: grupoMobileData.id, subGrupoId: s.id })}
                        className={`px-3 py-2 text-xs whitespace-nowrap border-b-2 transition ${subAtivo ? tema.catActive : tema.catInactive}`}
                      >
                        {s.nome}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Drawer de categorias */}
      <CategoriasDrawer
        aberto={menuCategoriasAberto}
        onClose={() => setMenuCategoriasAberto(false)}
        gruposComSubs={gruposComSubs}
        filtro={filtro}
        setFiltro={setFiltro}
        tema={tema}
        contNovidades={contNovidades}
        contOfertas={contOfertas}
        totalProdutos={produtos.length}
      />

      {/* Busca mobile */}
      <div className={`sm:hidden px-4 py-3 ${tema.mobileBar}`}>
        <div className={`flex items-center ${tema.mobileSearch} rounded-full px-3 py-2 gap-2`}>
          <Search size={14} className={`${tema.searchIcon} shrink-0`} />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar produto..."
            className={`bg-transparent text-sm ${tema.mobileSearchInput} outline-none w-full`}
          />
        </div>
      </div>

      {(() => {
        const grupoId =
          filtro.tipo === "grupo" ? filtro.grupoId :
          filtro.tipo === "subgrupo" ? filtro.grupoId : null;
        if (grupoId) {
          const grupo = grupos.find(g => g.id === grupoId);
          if (grupo) return <CategoryBanner grupo={grupo} tema={tema} />;
        }
        return <BannerSlider banners={banners} />;
      })()}

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <p className={`text-sm ${tema.countText}`}>
            {getFiltroLabel() ? (
              <>{getFiltroLabel()} · </>
            ) : null}
            <span className={`font-medium ${tema.countNumber}`}>{produtosFiltrados.length}</span>{" "}
            {produtosFiltrados.length === 1 ? "produto" : "produtos"}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {produtosFiltrados.map((produto) => (
            <ProdutoCard
              key={produto.id}
              produto={{
                id: produto.id,
                codigo: produto.codigo,
                nome: produto.nome,
                descricao: produto.descricao,
                videoUrl: produto.videoUrl,
                precoVista: produto._precoVista,
                precoPrazo: produto._precoPrazo,
                cores: produto.cores,
                imagemPrincipalOverride: produto._imgPrincipal,
              }}
              catalogo={catalogo}
              pathCatalogo={pathCatalogo}
              precoVisivel={precoVisivel}
              onVerPreco={onAbrirCadastro}
              onAdicionarCarrinho={adicionar}
            />
          ))}
        </div>

        {produtosFiltrados.length === 0 && (
          <div className={`text-center py-20 ${tema.countText}`}>
            <p className="text-4xl mb-3">{tema.emptyIcon}</p>
            <p className="font-medium">Nenhum produto encontrado</p>
            <button onClick={() => { setFiltro({ tipo: "todos" }); setBusca(""); }} className="text-sm underline mt-2 opacity-70 hover:opacity-100">
              Limpar filtros
            </button>
          </div>
        )}
      </main>

      {!precoVisivel && catalogo !== "VAREJO" && (
        <StickyLeadBar catalogo={catalogo} onAbrir={onAbrirCadastro} />
      )}
    </div>
  );
}

export default function CatalogoClient(props: Props) {
  const isB2B = props.catalogo !== "VAREJO";
  const [precoVisivel, setPrecoVisivel] = useState(!isB2B);
  const [modalAberto, setModalAberto] = useState(false);

  function handleAprovado() {
    setPrecoVisivel(true);
    setModalAberto(false);
  }

  return (
    <CartProvider catalogo={props.catalogo} vendedorSlug={props.vendedorSlug}>
      {isB2B && (modalAberto || !precoVisivel) && (
        <RegistroWall
          catalogo={props.catalogo as "ATACADO" | "FABRICA"}
          aberto={modalAberto}
          onClose={() => setModalAberto(false)}
          onAprovado={handleAprovado}
        />
      )}

      <CatalogoInner
        {...props}
        grupos={props.grupos ?? []}
        precoVisivel={precoVisivel}
        onAbrirCadastro={() => setModalAberto(true)}
      />
    </CartProvider>
  );
}
