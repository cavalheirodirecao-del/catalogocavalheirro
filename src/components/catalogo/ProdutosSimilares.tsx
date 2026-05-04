"use client";

import Link from "next/link";
import { formatarMoeda } from "@/lib/utils";

interface ProdutoSimples {
  id: string;
  nome: string;
  codigo: string;
  precoVista: number;
  imagemUrl: string | null;
  totalCores: number;
}

interface Props {
  produtos: ProdutoSimples[];
  pathCatalogo: string;
  titulo?: string;
}

const IMG_PADRAO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='14' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ESem foto%3C/text%3E%3C/svg%3E";

export default function ProdutosSimilares({ produtos, pathCatalogo, titulo = "Produtos similares" }: Props) {
  if (produtos.length === 0) return null;

  return (
    <div className="mt-12 border-t border-gray-100 pt-8">
      <h2 className="text-xl font-bold mb-4">{titulo}</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
        {produtos.map((p) => (
          <Link
            key={p.id}
            href={`/${pathCatalogo}/produto/${p.id}`}
            className="shrink-0 w-48 group"
          >
            <div className="aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden mb-2">
              <img
                src={p.imagemUrl ?? IMG_PADRAO}
                alt={p.nome}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
            </div>
            <p className="text-xs text-gray-400 font-mono">{p.codigo}</p>
            <p className="text-sm font-semibold leading-tight mt-0.5 line-clamp-2">{p.nome}</p>
            <p className="text-sm font-bold mt-1">{formatarMoeda(p.precoVista)}</p>
            {p.totalCores > 1 && (
              <p className="text-xs text-gray-400">{p.totalCores} cores</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
