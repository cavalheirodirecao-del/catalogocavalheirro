// Tipos compartilhados pelos componentes PDF

export type TabelaPreco = "VAREJO" | "ATACADO" | "FABRICA" | "SEM_PRECO";
export type LayoutPDF = "UMA_FOTO" | "TRES_FOTOS";

export interface GradeItemPDF {
  id: string;
  valor: string;
  ordem: number;
}

export interface EstoquePDF {
  quantidade: number;
}

export interface VariantePDF {
  id: string;
  gradeItem: GradeItemPDF;
  estoque: EstoquePDF | null;
}

export interface ImagemPDF {
  url: string;
  principal: boolean;
  ordem: number;
}

export interface CorPDF {
  id: string;
  nome: string;
  hexCor: string | null;
  imagens: ImagemPDF[];
  variantes: VariantePDF[];
}

export interface ProdutoPDF {
  id: string;
  codigo: string;
  nome: string;
  imagemPrincipal: string | null;
  precoVarejoVista: number;
  precoVarejoPrazo: number;
  precoAtacadoVista: number;
  precoAtacadoPrazo: number;
  precoFabricaVista: number;
  precoFabricaPrazo: number;
  cores: CorPDF[];
}

export function getPrecos(produto: ProdutoPDF, tabela: TabelaPreco): { vista: number; prazo: number } | null {
  if (tabela === "SEM_PRECO") return null;
  if (tabela === "VAREJO") return { vista: produto.precoVarejoVista, prazo: produto.precoVarejoPrazo };
  if (tabela === "ATACADO") return { vista: produto.precoAtacadoVista, prazo: produto.precoAtacadoPrazo };
  return { vista: produto.precoFabricaVista, prazo: produto.precoFabricaPrazo };
}

export function formatMoeda(v: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export function getFotoProduto(produto: ProdutoPDF): string | null {
  // Cascata: imagemPrincipal → 1ª imagem da 1ª cor
  if (produto.imagemPrincipal) return produto.imagemPrincipal;
  for (const cor of produto.cores) {
    const principal = cor.imagens.find(i => i.principal);
    if (principal) return principal.url;
    if (cor.imagens.length > 0) return cor.imagens[0].url;
  }
  return null;
}

export function getFotosCor(cor: CorPDF, produto: ProdutoPDF): string[] {
  if (cor.imagens.length > 0) {
    return cor.imagens.sort((a, b) => a.ordem - b.ordem).map(i => i.url);
  }
  const fallback = getFotoProduto(produto);
  return fallback ? [fallback] : [];
}

export function getVariantesDisponiveis(cor: CorPDF): VariantePDF[] {
  return cor.variantes
    .filter(v => v.estoque === null || v.estoque.quantidade > 0)
    .sort((a, b) => a.gradeItem.ordem - b.gradeItem.ordem);
}
