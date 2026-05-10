"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, X, Minus, Plus, ChevronLeft, ChevronRight, Play, Ruler, ZoomIn } from "lucide-react";
import { CartProvider, useCart } from "./CartProvider";
import ProdutosSimilares from "./ProdutosSimilares";
import Lightbox from "./Lightbox";
import { formatarMoeda } from "@/lib/utils";
import Link from "next/link";

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

interface Props {
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
  similares: ProdutoSimples[];
}

const IMG_PADRAO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='14' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ESem foto%3C/text%3E%3C/svg%3E";

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:shorts\/|embed\/|watch\?v=))([a-zA-Z0-9_-]{11})/);
  return match?.[1] ?? null;
}

// ─── Carrinho ────────────────────────────────────────────
function CarrinhoDrawer({ precos }: { precos: Record<string, number> }) {
  const { itens, remover, alterarQtd, totalItens, totalValor } = useCart();
  const [aberto, setAberto] = useState(false);
  const total = totalValor(precos);

  return (
    <>
      <button onClick={() => setAberto(true)} className="relative">
        <ShoppingCart size={22} />
        {totalItens > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">{totalItens}</span>
        )}
      </button>
      {aberto && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAberto(false)} />
          <div className="relative bg-white w-full max-w-sm h-full flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold text-lg">Meu Carrinho</h2>
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
                    <p className="text-sm font-bold mt-1">{formatarMoeda((precos[item.varianteId] ?? 0) * item.quantidade)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <button onClick={() => alterarQtd(item.varianteId, item.quantidade - 1)} className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-100"><Minus size={10} /></button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantidade}</span>
                      <button onClick={() => alterarQtd(item.varianteId, item.quantidade + 1)} className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-100"><Plus size={10} /></button>
                      <button onClick={() => remover(item.varianteId)} className="ml-auto text-red-400 hover:text-red-600"><X size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t space-y-3">
              <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatarMoeda(total)}</span></div>
              <Link href="/checkout?catalogo=VAREJO" onClick={() => setAberto(false)}
                className={`block w-full text-center bg-black text-white rounded-lg py-3 text-sm font-semibold transition ${itens.length === 0 ? "opacity-40 pointer-events-none" : "hover:bg-gray-800"}`}>
                Finalizar Pedido
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Inner ────────────────────────────────────────────────
function VarejoDetalheInner({ produto, similares }: Omit<Props, "vendedorSlug" | "catalogo">) {
  const { adicionar, totalItens } = useCart();
  const youtubeId = produto.videoUrl ? getYouTubeId(produto.videoUrl) : null;

  type Tab = "foto" | "video";
  const [tab, setTab] = useState<Tab>("foto");
  const [corSelecionada, setCorSelecionada] = useState<Cor | null>(produto.cores[0] ?? null);
  const [fotoIdx, setFotoIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [tamSelecionado, setTamSelecionado] = useState<Variante | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [mostrarTabela, setMostrarTabela] = useState(false);
  const [adicionado, setAdicionado] = useState(false);

  const fotosRaw = corSelecionada?.imagens.sort((a, b) => a.ordem - b.ordem).map(i => i.url) ?? [];
  const fotos = fotosRaw.length > 0 ? fotosRaw : (produto.imagemPrincipal ? [produto.imagemPrincipal] : []);
  const imgAtiva = fotos[fotoIdx] ?? IMG_PADRAO;

  // Mapa de preços para o carrinho
  const precos: Record<string, number> = {};
  produto.cores.forEach(c => c.variantes.forEach(v => { precos[v.id] = produto.precoVista; }));

  function selecionarCor(cor: Cor) {
    setCorSelecionada(cor);
    setTamSelecionado(null);
    setFotoIdx(0);
    setTab("foto");
  }

  const thumbnails = corSelecionada?.imagens.sort((a, b) => a.ordem - b.ordem) ?? [];
  const prevFoto = () => setFotoIdx(i => (i - 1 + fotos.length) % fotos.length);
  const nextFoto = () => setFotoIdx(i => (i + 1) % fotos.length);

  const variantesDisponiveis = corSelecionada?.variantes
    .filter(v => Math.max(0, (v.estoque?.quantidade ?? 0) - (v.estoque?.pendente ?? 0)) > 0)
    .sort((a, b) => a.gradeItem.ordem - b.gradeItem.ordem) ?? [];

  const disponivel = tamSelecionado
    ? Math.max(0, (tamSelecionado.estoque?.quantidade ?? 0) - (tamSelecionado.estoque?.pendente ?? 0))
    : 0;

  useEffect(() => {
    if (tamSelecionado && disponivel > 0) {
      setQuantidade(q => Math.min(q, disponivel));
    }
  }, [tamSelecionado]);

  function handleAdicionar() {
    if (!tamSelecionado || !corSelecionada) return;
    const img = corSelecionada.imagens.find(i => i.principal)?.url ?? corSelecionada.imagens[0]?.url ?? produto.imagemPrincipal ?? IMG_PADRAO;
    adicionar({
      varianteId: tamSelecionado.id,
      produtoId: produto.id,
      produtoNome: produto.nome,
      corId: corSelecionada.id,
      corNome: corSelecionada.nome,
      tamanho: tamSelecionado.gradeItem.valor,
      imagemUrl: img,
      quantidade,
      precoUnitario: produto.precoVista,
      precoPrazo: produto.precoPrazo,
    });
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 2000);
  }

  const descLines = (produto.descricaoCompleta ?? produto.descricao ?? "").split("\n").filter(Boolean);

  return (
    <div className="min-h-screen bg-white pb-12">

      {/* Header simples */}
      <header className="bg-black text-white px-4 h-14 flex items-center justify-between sticky top-0 z-30">
        <Link href="/varejo" className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white transition">
          <ChevronLeft size={16} /> Voltar
        </Link>
        <p className="font-bold">Varejo</p>
        <CarrinhoDrawer precos={precos} />
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* ── Galeria ─────────────────────────────────── */}
        <div className="flex gap-3">
          {/* Thumbnails verticais */}
          <div className="flex flex-col gap-2 w-16 shrink-0">
            {thumbnails.map((img, i) => (
              <button key={img.url} onClick={() => { setFotoIdx(i); setTab("foto"); }}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${fotoIdx === i && tab === "foto" ? "border-black" : "border-transparent hover:border-gray-300"}`}>
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
            {youtubeId && (
              <button onClick={() => setTab("video")}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex items-center justify-center bg-gray-900 transition ${tab === "video" ? "border-black" : "border-transparent hover:border-gray-300"}`}>
                <Play size={20} className="text-white" fill="white" />
              </button>
            )}
          </div>

          {/* Imagem principal / Vídeo */}
          <div className="flex-1 rounded-xl overflow-hidden bg-gray-100 relative">
            {tab === "video" && youtubeId ? (
              <div className="w-full" style={{ aspectRatio: "9/16" }}>
                <iframe src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&controls=1`}
                  className="w-full h-full" allow="autoplay" allowFullScreen />
              </div>
            ) : (
              <div className="aspect-[3/4] relative group cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
                <img src={imgAtiva} alt={produto.nome} className="w-full h-full object-cover" />
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
                <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <ZoomIn size={14} className="text-white" />
                </div>
                {fotos.length > 1 && (
                  <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs rounded-full px-2 py-0.5 tabular-nums">
                    {fotoIdx + 1}/{fotos.length}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Info ────────────────────────────────────── */}
        <div className="space-y-5">
          <div>
            <p className="text-xs text-gray-400 font-mono">{produto.codigo}</p>
            <h1 className="text-2xl font-bold mt-1 leading-tight">{produto.nome}</h1>
            <div className="mt-3">
              <p className="text-3xl font-bold">{formatarMoeda(produto.precoVista)}</p>
              <p className="text-sm text-gray-400 mt-0.5">{formatarMoeda(produto.precoPrazo)} a prazo</p>
            </div>
            {produto.descricao && <p className="text-sm text-gray-500 mt-2">{produto.descricao}</p>}
          </div>

          {produto.tabelaMedidas && (
            <button onClick={() => setMostrarTabela(true)}
              className="inline-flex items-center gap-2 text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition">
              <Ruler size={14} /> Tabela de medidas
            </button>
          )}

          {/* Cor */}
          {produto.cores.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Cor: <span className="font-normal text-gray-500">{corSelecionada?.nome}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {produto.cores.map(cor => (
                  <button key={cor.id} onClick={() => selecionarCor(cor)} title={cor.nome}
                    className={`w-9 h-9 rounded-full border-4 transition ${corSelecionada?.id === cor.id ? "border-black scale-110" : "border-white shadow-md hover:scale-105"}`}
                    style={{ backgroundColor: cor.hexCor ?? "#ccc" }} />
                ))}
              </div>
            </div>
          )}

          {/* Tamanho */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Tamanho: {tamSelecionado && <span className="font-normal text-gray-500">{tamSelecionado.gradeItem.valor}</span>}
            </p>
            <div className="flex gap-2 flex-wrap">
              {variantesDisponiveis.map(v => (
                <button key={v.id} onClick={() => setTamSelecionado(v)}
                  className={`min-w-[44px] px-3 py-2 rounded-lg border-2 text-sm font-semibold transition ${tamSelecionado?.id === v.id ? "border-black bg-black text-white" : "border-gray-200 hover:border-gray-400"}`}>
                  {v.gradeItem.valor}
                </button>
              ))}
              {variantesDisponiveis.length === 0 && (
                <p className="text-sm text-red-400">Sem estoque nesta cor</p>
              )}
            </div>
          </div>

          {/* Quantidade */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Quantidade</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantidade(q => Math.max(1, q - 1))}
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition">
                <Minus size={14} />
              </button>
              <span className="w-8 text-center font-bold text-lg">{quantidade}</span>
              <button
                onClick={() => setQuantidade(q => tamSelecionado ? Math.min(disponivel, q + 1) : q + 1)}
                disabled={tamSelecionado !== null && quantidade >= disponivel}
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition disabled:opacity-30 disabled:cursor-not-allowed">
                <Plus size={14} />
              </button>
            </div>
            {tamSelecionado && disponivel > 0 && quantidade >= disponivel && (
              <p className="text-xs text-orange-500 mt-2">
                Máximo para pronta entrega: {disponivel} {disponivel === 1 ? "unidade" : "unidades"}
              </p>
            )}
          </div>

          {/* Botão comprar */}
          <button onClick={handleAdicionar} disabled={!tamSelecionado}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition ${
              adicionado ? "bg-green-600 text-white" : tamSelecionado ? "bg-black text-white hover:bg-gray-800" : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}>
            <ShoppingCart size={18} />
            {adicionado ? "Adicionado ao carrinho!" : tamSelecionado ? "Adicionar ao carrinho" : "Selecione um tamanho"}
          </button>
        </div>
      </div>

      {/* ── Descrição completa ──────────────────────────── */}
      {descLines.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 mt-2">
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="font-semibold text-gray-700 mb-3">Descrição do produto</h2>
            <div className="space-y-1.5">
              {descLines.map((linha, i) => (
                <p key={i} className="text-sm text-gray-600 leading-relaxed">{linha}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Produtos similares ──────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4">
        <ProdutosSimilares produtos={similares} pathCatalogo="varejo" />
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

      {/* Lightbox */}
      {lightboxOpen && fotos.length > 0 && (
        <Lightbox fotos={fotos} idx={fotoIdx} onChange={setFotoIdx} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  );
}

export default function ProdutoDetalheVarejo(props: Props) {
  return (
    <CartProvider catalogo="VAREJO" vendedorSlug={props.vendedorSlug}>
      <VarejoDetalheInner {...props} />
    </CartProvider>
  );
}
