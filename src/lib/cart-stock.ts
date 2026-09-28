export function limitarQuantidade(quantidade: number, disponivel: number): number {
  if (!Number.isFinite(quantidade) || !Number.isFinite(disponivel)) return 0;
  return Math.max(0, Math.min(Math.floor(quantidade), Math.floor(disponivel)));
}

export function ajustarCarrinho<T extends { varianteId: string; quantidade: number }>(itens: T[], estoque: Record<string, number>): T[] {
  const usados: Record<string, number> = {};
  return itens.flatMap(item => {
    const quantidade = limitarQuantidade(item.quantidade, (estoque[item.varianteId] ?? 0) - (usados[item.varianteId] ?? 0));
    usados[item.varianteId] = (usados[item.varianteId] ?? 0) + quantidade;
    return quantidade > 0 ? [{ ...item, quantidade }] : [];
  });
}
