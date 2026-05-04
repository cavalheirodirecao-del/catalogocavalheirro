"use client";

import { useMemo, useState } from "react";
import { useCart } from "./CartProvider";
import { formatarMoeda } from "@/lib/utils";
import { Check } from "lucide-react";

const IMG_PADRAO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3C/svg%3E";

interface Variante {
  id: string;
  gradeItem: { id: string; valor: string; ordem: number };
  estoque: { quantidade: number; pendente?: number } | null;
}

interface Cor {
  id: string;
  nome: string;
  hexCor: string | null;
  imagens: { url: string; principal: boolean; ordem: number }[];
  variantes: Variante[];
}

interface Produto {
  id: string;
  nome: string;
  imagemPrincipal?: string | null;
  precoVista: number;
  precoPrazo: number;
  cores: Cor[];
}

interface Props {
  produto: Produto;
  onConcluir: () => void;
}

export default function MiniGrade({ produto, onConcluir }: Props) {
  const { adicionar } = useCart();

  const tamanhos = useMemo(() => {
    const map = new Map<string, { id: string; valor: string; ordem: number }>();
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

  const [adicionado, setAdicionado] = useState(false);

  function setQtd(corId: string, gradeItemId: string, val: number) {
    setGrade(g => ({ ...g, [corId]: { ...g[corId], [gradeItemId]: Math.max(0, val) } }));
  }

  function getEstoque(cor: Cor, gradeItemId: string): number {
    const e = cor.variantes.find(v => v.gradeItem.id === gradeItemId)?.estoque;
    return Math.max(0, (e?.quantidade ?? 0) - (e?.pendente ?? 0));
  }

  function getVarianteId(cor: Cor, gradeItemId: string): string | null {
    return cor.variantes.find(v => v.gradeItem.id === gradeItemId)?.id ?? null;
  }

  function getImgCor(cor: Cor): string {
    return cor.imagens.find(i => i.principal)?.url
      ?? cor.imagens[0]?.url
      ?? produto.imagemPrincipal
      ?? IMG_PADRAO;
  }

  const totalPecas = useMemo(
    () => Object.values(grade).flatMap(Object.values).reduce((a, b) => a + b, 0),
    [grade]
  );

  function handleAdicionar() {
    if (totalPecas === 0) return;
    for (const cor of produto.cores) {
      for (const t of tamanhos) {
        const qty = grade[cor.id]?.[t.id] ?? 0;
        if (qty <= 0) continue;
        const varianteId = getVarianteId(cor, t.id);
        if (!varianteId) continue;
        adicionar({
          varianteId,
          produtoId: produto.id,
          produtoNome: produto.nome,
          corId: cor.id,
          corNome: cor.nome,
          tamanho: t.valor,
          imagemUrl: getImgCor(cor),
          quantidade: qty,
          precoUnitario: produto.precoVista,
        });
      }
    }
    setAdicionado(true);
    setTimeout(() => {
      setAdicionado(false);
      onConcluir();
    }, 900);
  }

  return (
    <div className="border border-gray-100 rounded-xl bg-gray-50 p-3 space-y-3">
      {/* Tabela grade */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-separate border-spacing-y-1">
          <thead>
            <tr>
              <th className="text-left text-gray-400 font-normal pb-1 pr-2 min-w-[80px]">Cor</th>
              {tamanhos.map(t => (
                <th key={t.id} className="text-center text-gray-500 font-medium pb-1 px-1 min-w-[36px]">
                  {t.valor}
                </th>
              ))}
              <th className="text-right text-gray-400 font-normal pb-1 pl-2">Qtd</th>
            </tr>
          </thead>
          <tbody>
            {produto.cores.map(cor => {
              const totalCor = tamanhos.reduce((s, t) => s + (grade[cor.id]?.[t.id] ?? 0), 0);
              return (
                <tr key={cor.id}>
                  <td className="pr-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 border border-gray-200"
                        style={{ backgroundColor: cor.hexCor ?? "#ccc" }}
                      />
                      <span className="text-gray-700 truncate max-w-[60px]">{cor.nome}</span>
                    </div>
                  </td>
                  {tamanhos.map(t => {
                    const estoq = getEstoque(cor, t.id);
                    const qty = grade[cor.id]?.[t.id] ?? 0;
                    return (
                      <td key={t.id} className="px-1 text-center">
                        {estoq > 0 ? (
                          <input
                            type="number"
                            min={0}
                            max={estoq}
                            value={qty || ""}
                            placeholder="0"
                            onChange={e => setQtd(cor.id, t.id, Number(e.target.value))}
                            className="w-9 h-7 text-center text-xs border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-black"
                          />
                        ) : (
                          <span className="text-gray-200 select-none">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="pl-2 text-right">
                    <span className={`font-semibold ${totalCor > 0 ? "text-black" : "text-gray-300"}`}>
                      {totalCor}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Rodapé */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-200">
        <div>
          {totalPecas > 0 && (
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-black">{totalPecas} peça{totalPecas !== 1 ? "s" : ""}</span>
              {" · "}{formatarMoeda(totalPecas * produto.precoVista)}
            </p>
          )}
        </div>
        <button
          onClick={handleAdicionar}
          disabled={totalPecas === 0 || adicionado}
          className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-full transition ${
            adicionado
              ? "bg-green-500 text-white"
              : totalPecas > 0
              ? "bg-black text-white hover:bg-gray-800"
              : "bg-gray-100 text-gray-300 cursor-not-allowed"
          }`}
        >
          {adicionado ? <><Check size={12} /> Adicionado</> : "Adicionar"}
        </button>
      </div>
    </div>
  );
}
