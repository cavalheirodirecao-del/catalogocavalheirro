"use client";

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";

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
    const prev = itensRef.current;
    const existe = prev.find((i) => i.varianteId === item.varianteId);
    const newItens = existe
      ? prev.map((i) =>
          i.varianteId === item.varianteId
            ? { ...i, quantidade: i.quantidade + (item.quantidade ?? 1) }
            : i
        )
      : [...prev, { ...item, quantidade: item.quantidade ?? 1 }];
    salvar(newItens);
  }

  function remover(varianteId: string) {
    salvar(itensRef.current.filter((i) => i.varianteId !== varianteId));
  }

  function alterarQtd(varianteId: string, quantidade: number) {
    if (quantidade <= 0) {
      remover(varianteId);
      return;
    }
    salvar(itensRef.current.map((i) => (i.varianteId === varianteId ? { ...i, quantidade } : i)));
  }

  function limpar() {
    itensRef.current = [];
    setItens([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  const totalItens = itens.reduce((acc, i) => acc + i.quantidade, 0);

  function totalValor(precos: Record<string, number>): number {
    return itens.reduce((acc, i) => acc + (precos[i.varianteId] ?? 0) * i.quantidade, 0);
  }

  return (
    <CartContext.Provider
      value={{ itens, catalogo, vendedorSlug, adicionar, remover, alterarQtd, limpar, totalItens, totalValor }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
  return ctx;
}
