"use client";
import CatalogImage from "./CatalogImage";

import { useState, useMemo } from "react";
import { ShoppingCart, X, Minus, Plus, ChevronLeft, ChevronRight, Play, Ruler, ZoomIn, Lock } from "lucide-react";
import QuantityMatrix from "./QuantityMatrix";
import RegistroWall from "./RegistroWall";
import { CartProvider, useCart } from "./CartProvider";
import ProdutosSimilares from "./ProdutosSimilares";
import Lightbox from "./Lightbox";
import { formatarMoeda } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface GradeItem { id: string; valor: string; ordem: number; }
interface Variante { id: string; gradeItem: GradeItem; estoque: { quantidade: number; pendente: number } | null; }
interface Cor {
  id: string; nome: string; hexCor: string | null;
  imagens: { url: string; principal: boolean; ordem: number }[];
  variantes: Variante[];
}

interface ProdutoSimples {
  id: string; nome: string; codigo: string; precoVista: number;
  imagemUrl: string | null; totalCores: number;
}

interface ProdutoDetalheProps {
  produto: {
    id: string; codigo: string; nome: string;
    descricao: string | null; descricaoCompleta: string | null;
    imagemPrincipal: string | null; videoUrl: string | null;
    tabelaMedidas: string | null;
    precoVista: number; precoPrazo: number;
    cores: Cor[];
  };
  catalogo: string;
  vendedorSlug: string | null;
  pathCatalogo: string;
  qtdMinima: number;
  similares: ProdutoSimples[];
}

const IMG_PADRAO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='14' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ESem foto%3C/text%3E%3C/svg%3E";

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:shorts\/|embed\/|watch\?v=))([a-zA-Z0-9_-]{11})/);
  return match?.[1] ?? null;
}

// ─── Carrinho ────────────────────────────────────────────
function CarrinhoDrawer({ catalogo, precoVista, qtdMinima }: {
  catalogo: string; precoVista: number; qtdMinima: number;
}) {
  const { itens, remover, alterarQtd, limiteEstoque, totalItens } = useCart();
  const [aberto, setAberto] = useState(false);
  const total = itens.reduce((acc, i) => acc + i.precoUnitario * i.quantidade, 0);
  const totalQtd = itens.reduce((acc, i) => acc + i.quantidade, 0);
  const atingiuMinimo = totalQtd >= qtdMinima;

  return (
    <>
      <button onClick={() => setAberto(true)} className="fixed bottom-6 right-6 bg-black text-white rounded-full p-4 shadow-lg hover:bg-gray-800 transition z-40">
        <ShoppingCart size={22} />
        {totalItens > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{totalItens}</span>
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
              {itens.length === 0 && <p className="text-gray-400 text-sm text-center mt-8">Nenhum item adicionado.</p>}
              {itens.map((item) => (
                <div key={item.varianteId} className="flex gap-3">
                  <img src={item.imagemUrl} alt={item.produtoNome} className="w-16 h-16 object-cover rounded-lg bg-gray-100" />
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-tight">{item.produtoNome}</p>
                    <p className="text-xs text-gray-400">{item.tamanho} · {item.corNome}</p>
                    <p className="text-sm font-bold mt-1">{formatarMoeda(item.precoUnitario * item.quantidade)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <button onClick={() => alterarQtd(item.varianteId, item.quantidade - 1)} className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-100"><Minus size={10} /></button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantidade}</span>
                      <button disabled={item.quantidade >= limiteEstoque(item.varianteId)} title="Limite do estoque disponível" onClick={() => alterarQtd(item.varianteId, item.quantidade + 1)} className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"><Plus size={10} /></button>
                      <button onClick={() => remover(item.varianteId)} className="ml-auto text-red-400 hover:text-red-600"><X size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t space-y-3">
              <div className={`text-xs rounded-lg px-3 py-2 ${atingiuMinimo ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                {atingiuMinimo ? `✓ Mínimo atingido (${totalQtd} peças)` : `Mínimo: ${qtdMinima} peças — faltam ${qtdMinima - totalQtd}`}
              </div>
              <div className="flex justify-between font-bold"><span>Total</span><span>{formatarMoeda(total)}</span></div>
              <Link href={`/checkout?catalogo=${catalogo}`} onClick={() => setAberto(false)}
                className={`block w-full text-center bg-black text-white rounded-lg py-3 text-sm font-semibold transition ${!atingiuMinimo || itens.length === 0 ? "opacity-40 pointer-events-none" : "hover:bg-gray-800"}`}>
                Finalizar Pedido
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Conteúdo ────────────────────────────────────────────
function DetalheInner({ produto, catalogo, pathCatalogo, qtdMinima, similares }: Omit<ProdutoDetalheProps, "vendedorSlug">) {
  const router = useRouter();
  const { adicionar, itens, totalItens } = useCart();
  const youtubeId = produto.videoUrl ? getYouTubeId(produto.videoUrl) : null;

  const isB2B = catalogo === "ATACADO";
  const [precoVisivel, setPrecoVisivel] = useState(!isB2B);
  const [modalAberto, setModalAberto] = useState(false);

  // Galeria: tabs foto / vídeo
  type Tab = "foto" | "video";
  const [tab, setTab] = useState<Tab>("foto");
  const [corGaleria, setCorGaleria] = useState<Cor | null>(produto.cores[0] ?? null);
  const [fotoIdx, setFotoIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [mostrarTabela, setMostrarTabela] = useState(false);

  const fotosRaw = corGaleria?.imagens.sort((a, b) => a.ordem - b.ordem).map(i => i.url) ?? [];
  // Fallback: se a cor não tem fotos próprias, usa imagemPrincipal do produto
  const fotos = fotosRaw.length > 0 ? fotosRaw : (produto.imagemPrincipal ? [produto.imagemPrincipal] : []);
  const imgAtiva = fotos[fotoIdx] ?? IMG_PADRAO;

  const tamanhos: GradeItem[] = useMemo(() => {
    const map = new Map<string, GradeItem>();
    for (const cor of produto.cores)
      for (const v of cor.variantes)
        if (!map.has(v.gradeItem.id)) map.set(v.gradeItem.id, v.gradeItem);
    return Array.from(map.values()).sort((a, b) => a.ordem - b.ordem);
  }, [produto.cores]);

  const [grade, setGrade] = useState<Record<string, Record<string, number>>>(() => {
    const init: Record<string, Record<string, number>> = {};
    for (const cor of produto.cores) {
      init[cor.id] = {};
      for (const t of tamanhos) init[cor.id][t.id] = 0;
    }
    return init;
  });

  function selecionarCor(cor: Cor) {
    setCorGaleria(cor);
    setFotoIdx(0);
    setTab("foto");
  }

  function setQtd(corId: string, gradeItemId: string, val: number) {
    setGrade(g => ({ ...g, [corId]: { ...g[corId], [gradeItemId]: Math.max(0, Math.min(getEstoque(produto.cores.find(c => c.id === corId)!, gradeItemId), Math.floor(Number.isFinite(val) ? val : 0))) } }));
  }

  function getEstoque(cor: Cor, gradeItemId: string): number {
    const e = cor.variantes.find(v => v.gradeItem.id === gradeItemId)?.estoque;
    const varianteId = cor.variantes.find(v => v.gradeItem.id === gradeItemId)?.id;
    const noCarrinho = itens.find(i => i.varianteId === varianteId)?.quantidade ?? 0;
    return Math.max(0, (e?.quantidade ?? 0) - (e?.pendente ?? 0) - noCarrinho);
  }

  function getVarianteId(cor: Cor, gradeItemId: string): string | null {
    return cor.variantes.find(v => v.gradeItem.id === gradeItemId)?.id ?? null;
  }

  const totalPecas = useMemo(() =>
    Object.values(grade).flatMap(Object.values).reduce((a, b) => a + b, 0), [grade]);
  const totalValor = totalPecas * produto.precoVista;

  function handleAdicionar() {
    let adicionou = false;
    for (const cor of produto.cores) {
      for (const t of tamanhos) {
        const qty = Math.min(grade[cor.id]?.[t.id] ?? 0, getEstoque(cor, t.id));
        if (qty <= 0) continue;
        const varianteId = getVarianteId(cor, t.id);
        if (!varianteId) continue;
        const img = cor.imagens.find(i => i.principal)?.url ?? cor.imagens[0]?.url ?? produto.imagemPrincipal ?? IMG_PADRAO;
        adicionar({ varianteId, produtoId: produto.id, produtoNome: produto.nome, corId: cor.id, corNome: cor.nome, tamanho: t.valor, imagemUrl: img, quantidade: qty, precoUnitario: produto.precoVista, precoPrazo: produto.precoPrazo });
        adicionou = true;
      }
    }
    if (adicionou) router.push(`/${pathCatalogo}`);
  }

  const thumbnails = corGaleria?.imagens.sort((a, b) => a.ordem - b.ordem) ?? [];
  const prevFoto = () => setFotoIdx(i => (i - 1 + fotos.length) % fotos.length);
  const nextFoto = () => setFotoIdx(i => (i + 1) % fotos.length);
  const descLines = (produto.descricaoCompleta ?? produto.descricao ?? "").split("\n").filter(Boolean);

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <Link href={`/${pathCatalogo}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-black transition">
          <ChevronLeft size={16} /> Voltar ao catálogo
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Galeria ─────────────────────────────────── */}
        <div className="flex gap-3">
          {/* Thumbnails */}
          <div className="flex flex-col gap-2 w-16 shrink-0">
            {thumbnails.map((img, i) => (
              <button key={img.url} onClick={() => { setFotoIdx(i); setTab("foto"); }}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${fotoIdx === i && tab === "foto" ? "border-black" : "border-transparent hover:border-gray-300"}`}>
                <img loading="lazy" decoding="async" src={img.url} alt={`${produto.nome} — imagem ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
            {youtubeId && (
              <button onClick={() => setTab("video")}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex items-center justify-center bg-gray-900 transition ${tab === "video" ? "border-black" : "border-transparent hover:border-gray-300"}`}>
                <Play size={20} className="text-white" fill="white" />
              </button>
            )}
          </div>

          {/* Principal / Vídeo */}
          <div className="flex-1 overflow-hidden rounded-xl bg-gray-100 relative">
            {tab === "video" && youtubeId ? (
              <div className="w-full" style={{ aspectRatio: "9/16" }}>
                <iframe src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&controls=1`}
                  className="w-full h-full" allow="autoplay" allowFullScreen />
              </div>
            ) : (
              <div className="aspect-[3/4] relative group cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
                <CatalogImage priority sizes="(max-width: 768px) 100vw, 50vw" src={imgAtiva} alt={produto.nome} className="w-full h-full object-cover" />
                {/* Setas */}
                {fotos.length > 1 && (
                  <>
                    <button onClick={e => { e.stopPropagation(); prevFoto(); }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <ChevronLeft size={18} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); nextFoto(); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
                {/* Zoom hint */}
                <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <ZoomIn size={14} className="text-white" />
                </div>
                {/* Contador */}
                {fotos.length > 1 && (
                  <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs rounded-full px-2 py-0.5 tabular-nums">
                    {fotoIdx + 1}/{fotos.length}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Info + Grade ─────────────────────────────── */}
        <div className="space-y-5">
          <div>
            <p className="text-xs text-gray-400 font-mono">{produto.codigo}</p>
            <h1 className="text-2xl font-bold mt-1">{produto.nome}</h1>
            <div className="mt-2 flex items-baseline gap-3">
              {precoVisivel ? (
                <>
                  <span className="text-2xl font-bold">{formatarMoeda(produto.precoVista)}</span>
                  <span className="text-sm text-gray-400">{formatarMoeda(produto.precoPrazo)} a prazo</span>
                </>
              ) : (
                <button
                  onClick={() => setModalAberto(true)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-black border border-gray-200 rounded-lg px-3 py-2 transition"
                >
                  <Lock size={14} />
                  <span>Cadastre-se para ver o preço</span>
                </button>
              )}
            </div>
            {produto.descricao && <p className="text-sm text-gray-500 mt-2">{produto.descricao}</p>}
          </div>

          {/* Botão tabela de medidas */}
          {produto.tabelaMedidas && (
            <button onClick={() => setMostrarTabela(true)}
              className="inline-flex items-center gap-2 text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
              <Ruler size={14} /> Tabela de medidas
            </button>
          )}

          {/* Grade */}
          {tamanhos.length > 0 ? (
            <div>
              <QuantityMatrix colors={produto.cores} sizes={tamanhos} values={grade}
                available={(color, size) => getEstoque(produto.cores.find(c => c.id === color.id)!, size)}
                onChange={setQtd} onColor={color => selecionarCor(produto.cores.find(c => c.id === color.id)!)} />

              <div className="mt-4 flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                {precoVisivel ? (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">{totalPecas} {totalPecas === 1 ? "peça" : "peças"}</p>
                      <p className="text-xl font-bold">{formatarMoeda(totalValor)}</p>
                    </div>
                    <button onClick={handleAdicionar} disabled={totalPecas === 0}
                      className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed">
                      <ShoppingCart size={16} /> Adicionar ao pedido
                    </button>
                  </>
                ) : (
                  <button onClick={() => setModalAberto(true)}
                    className="w-full flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-gray-800 transition">
                    <Lock size={16} /> Ver preços para pedir
                  </button>
                )}
              </div>
              {totalPecas > 0 && totalPecas + totalItens < qtdMinima && (
                <p className="text-xs text-yellow-600 bg-yellow-50 rounded-lg px-3 py-2 mt-2">
                  Mínimo de {qtdMinima} peças — faltam {qtdMinima - totalPecas - totalItens} no pedido completo
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Produto sem grade de tamanhos.</p>
          )}
        </div>
      </div>

      {/* ── Descrição completa ──────────────────────────── */}
      {descLines.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="font-semibold text-gray-700 mb-3">Descrição</h2>
            <div className="space-y-1.5">
              {descLines.map((linha, i) => (
                <p key={i} className="text-sm text-gray-600 leading-relaxed">{linha}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Produtos similares ──────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4">
        <ProdutosSimilares produtos={similares} pathCatalogo={pathCatalogo} />
      </div>

      {/* ── Modal tabela de medidas ─────────────────────── */}
      {mostrarTabela && produto.tabelaMedidas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setMostrarTabela(false)}>
          <div className="relative bg-white rounded-2xl overflow-hidden max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">{produto.nome} — Tabela de Medidas</h3>
              <button onClick={() => setMostrarTabela(false)}><X size={20} /></button>
            </div>
            <img src={produto.tabelaMedidas} alt="Tabela de medidas" className="w-full object-contain max-h-[70vh]" />
          </div>
        </div>
      )}

      {isB2B && (
        <RegistroWall
          aberto={modalAberto}
          onClose={() => setModalAberto(false)}
          onAprovado={() => { setPrecoVisivel(true); setModalAberto(false); }}
          catalogo={catalogo as "ATACADO" | "FABRICA"}
        />
      )}

      <CarrinhoDrawer catalogo={catalogo} precoVista={produto.precoVista} qtdMinima={qtdMinima} />

      {/* Lightbox */}
      {lightboxOpen && fotos.length > 0 && (
        <Lightbox fotos={fotos} idx={fotoIdx} onChange={setFotoIdx} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  );
}

export default function ProdutoDetalheGrade(props: ProdutoDetalheProps) {
  return (
    <CartProvider catalogo={props.catalogo} vendedorSlug={props.vendedorSlug}>
      <DetalheInner {...props} />
    </CartProvider>
  );
}
