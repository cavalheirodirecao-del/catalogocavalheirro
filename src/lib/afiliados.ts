export const TIERS_VAREJO = [
  { nivel: "Bronze",   min: 0,   max: 5,   pct: 2,   pecas: "2 peças" },
  { nivel: "Prata",    min: 6,   max: 15,  pct: 4,   pecas: "3–4 peças" },
  { nivel: "Ouro",     min: 16,  max: 30,  pct: 6,   pecas: "5–6 peças" },
  { nivel: "Platina",  min: 31,  max: 50,  pct: 8,   pecas: "7–8 peças" },
  { nivel: "Diamante", min: 51,  max: null, pct: 10,  pecas: "9–10 peças" },
] as const;

export const TIERS_ATACADO = [
  { nivel: "Bronze",   min: 0,   max: 10,  pct: 0.5 },
  { nivel: "Prata",    min: 11,  max: 30,  pct: 1   },
  { nivel: "Ouro",     min: 31,  max: 60,  pct: 2   },
  { nivel: "Platina",  min: 61,  max: 100, pct: 3.5 },
  { nivel: "Diamante", min: 101, max: null, pct: 5  },
] as const;

export type TipoAfiliado = "VAREJO" | "ATACADO";

export function calcularTierAfiliado(
  qtdVendas: number,
  tipo: TipoAfiliado = "VAREJO"
): {
  pct: number;
  nivel: string;
  faixa: string;
  proximo: { min: number; pct: number; nivel: string; faltam: number } | null;
} {
  const tiers = tipo === "ATACADO" ? TIERS_ATACADO : TIERS_VAREJO;
  const tierAtual = [...tiers].reverse().find(t => qtdVendas >= t.min) ?? tiers[0];
  const idx = tiers.findIndex(t => t.nivel === tierAtual.nivel);
  const prox = tiers[idx + 1] ?? null;

  return {
    pct: tierAtual.pct,
    nivel: tierAtual.nivel,
    faixa: tierAtual.max != null
      ? `${tierAtual.min}–${tierAtual.max} vendas`
      : `${tierAtual.min}+ vendas`,
    proximo: prox
      ? { min: prox.min, pct: prox.pct, nivel: prox.nivel, faltam: Math.max(0, prox.min - qtdVendas) }
      : null,
  };
}

export function calcularComissao(totalVendas: number, pct: number): number {
  return (totalVendas * pct) / 100;
}

/** Gera slug a partir do nome: "João Silva" → "joao-silva" */
export function gerarSlugAfiliado(nome: string): string {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
