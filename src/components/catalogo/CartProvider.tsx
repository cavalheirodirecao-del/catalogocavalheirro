"use client";

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { ajustarCarrinho, limitarQuantidade } from "@/lib/cart-stock";

export interface ItemCarrinho {
  varianteId: string;
  produtoId: string;
  produtoNome: string;
  corId: string;
  corNome: string;
  tamanho: string;
  imagemUrl: string;
  quantidade: number;
  precoUnitario: number;  // sempre à vista
  precoPrazo?: number;    // preço a prazo (opcional, para recalcular no checkout)
}

interface CartContextValue {
  itens: ItemCarrinho[];
  catalogo: string;
  vendedorSlug: string | null;
  adicionar: (item: Omit<ItemCarrinho, "quantidade"> & { quantidade?: number }) => void;
  remover: (varianteId: string) => void;
  alterarQtd: (varianteId: string, quantidade: number) => void;
  limpar: () => void;
  totalItens: number;
  limiteEstoque: (varianteId: string) => number;
  totalValor: (precos: Record<string, number>) => number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "cavalheiro_cart";

export function CartProvider({
  children,
  catalogo,
  vendedorSlug,
}: {
  children: ReactNode;
  catalogo: string;
  vendedorSlug: string | null;
}) {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  // Ref mantém o valor atual de itens de forma síncrona (sem esperar re-render)
  const itensRef = useRef<ItemCarrinho[]>([]);
  const estoqueRef = useRef<Record<string, number> | null>(null);
  const [estoque, setEstoque] = useState<Record<string, number> | null>(null);
  const [aviso, setAviso] = useState("");

  // Mantém ref sempre em sincronia com o estado
  itensRef.current = itens;

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY);
      if (salvo) {
        const parsed = JSON.parse(salvo);
        if (parsed.catalogo === catalogo) {
          itensRef.current = parsed.itens ?? [];
          setItens(parsed.itens ?? []);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    let encerrado = false;
    let carregando = false;
    async function atualizar() {
      if (carregando) return;
      carregando = true;
      try {
        const res = await fetch("/api/catalogo/estoque", { cache: "no-store" });
        if (!res.ok) throw new Error("Estoque indisponível");
        const dados = await res.json();
        if (!dados || typeof dados !== "object" || Array.isArray(dados) || Object.values(dados).some(v => typeof v !== "number" || !Number.isFinite(v) || v < 0)) throw new Error("Estoque inválido");
        if (encerrado) return;
        estoqueRef.current = dados;
        setEstoque(dados);
        setAviso(atual => atual.includes("consulta") || atual.startsWith("Não foi possível consultar") ? "" : atual);
        const ajustados = ajustarCarrinho(itensRef.current, dados);
        if (JSON.stringify(ajustados) !== JSON.stringify(itensRef.current)) {
          salvar(ajustados);
          setAviso("Ajustamos as quantidades do carrinho ao estoque disponível. Confira seu pedido.");
        }
      } catch {
        if (!encerrado) {
          estoqueRef.current = null;
          setEstoque(null);
          setAviso("Não foi possível consultar o estoque. Aguarde para adicionar mais peças.");
        }
      } finally { carregando = false; }
    }
    void atualizar();
    const timer = setInterval(atualizar, 30000);
    window.addEventListener("focus", atualizar);
    return () => { encerrado = true; clearInterval(timer); window.removeEventListener("focus", atualizar); };
  }, [catalogo]);

  function limiteEstoque(varianteId: string) { return estoque?.[varianteId] ?? 0; }

  function salvar(novosItens: ItemCarrinho[]) {
    itensRef.current = novosItens;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ catalogo, itens: novosItens }));
    } catch {
      // quota excedida — estado em memória continua válido
    }
    setItens(novosItens);
  }

  function adicionar(item: Omit<ItemCarrinho, "quantidade"> & { quantidade?: number }) {
    if (!Number.isFinite(item.quantidade ?? 1) || (item.quantidade ?? 1) <= 0) return;
    const prev = itensRef.current;
    const existe = prev.find((i) => i.varianteId === item.varianteId);
    if (!estoqueRef.current) { setAviso("Aguarde a consulta de estoque para adicionar peças."); return; }
    const solicitada = (existe?.quantidade ?? 0) + (item.quantidade ?? 1);
    const quantidade = limitarQuantidade(solicitada, estoqueRef.current[item.varianteId] ?? 0);
    if (quantidade < solicitada) setAviso("Quantidade limitada ao estoque disponível para esta cor e tamanho.");
    if (quantidade <= 0) return;
    const newItens = existe
      ? prev.map((i) =>
          i.varianteId === item.varianteId
            ? { ...i, quantidade }
            : i
        )
      : [...prev, { ...item, quantidade }];
    salvar(newItens);
  }

  function remover(varianteId: string) {
    salvar(itensRef.current.filter((i) => i.varianteId !== varianteId));
  }

  function alterarQtd(varianteId: string, quantidade: number) {
    if (!Number.isFinite(quantidade)) return;
    if (quantidade <= 0) {
      remover(varianteId);
      return;
    }
    const atual = itensRef.current.find(i => i.varianteId === varianteId)?.quantidade ?? 0;
    if (!estoqueRef.current && quantidade > atual) { setAviso("Aguarde a consulta de estoque para adicionar peças."); return; }
    const limitada = limitarQuantidade(quantidade, estoqueRef.current?.[varianteId] ?? atual);
    if (limitada < quantidade) setAviso("Você atingiu o estoque disponível para esta cor e tamanho.");
    salvar(itensRef.current.map((i) => (i.varianteId === varianteId ? { ...i, quantidade: limitada } : i)).filter(i => i.quantidade > 0));
  }

  function limpar() {
    itensRef.current = [];
    setItens([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  const totalItens = itens.reduce((acc, i) => acc + i.quantidade, 0);

  function totalValor(precos: Record<string, number>): number {
    return itens.reduce((acc, i) => acc + (precos[i.varianteId] ?? i.precoUnitario) * i.quantidade, 0);
  }

  return (
    <CartContext.Provider
      value={{ itens, catalogo, vendedorSlug, adicionar, remover, alterarQtd, limpar, totalItens, totalValor, limiteEstoque }}
    >
      {children}
      {aviso && <div role="status" className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-lg rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 shadow-lg flex gap-3 items-start"><span>{aviso}</span><button type="button" aria-label="Fechar aviso" onClick={() => setAviso("")} className="ml-auto font-bold">×</button></div>}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
  return ctx;
}
