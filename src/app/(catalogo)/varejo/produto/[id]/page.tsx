import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProdutoDetalheVarejo from "@/components/catalogo/ProdutoDetalheVarejo";
import { getPreco } from "@/lib/utils";

export const revalidate = 300;

interface Props {
  params: { id: string };
  searchParams: { vendedor?: string };
}

export default async function VarejoProdutoPage({ params, searchParams }: Props) {
  const vendedorSlug = searchParams.vendedor ?? null;

  const produto = await prisma.produto.findUnique({
    where: { id: params.id, ativo: true },
    include: {
      cores: {
        where: { ativo: true },
        include: {
          imagens: { orderBy: { ordem: "asc" } },
          variantes: {
            where: { ativo: true },
            include: { gradeItem: true, estoque: true },
          },
        },
      },
    },
  });

  if (!produto) notFound();

  // Produtos similares do mesmo grupo
  const similaresBrutos = produto.grupoId
    ? await prisma.produto.findMany({
        where: { grupoId: produto.grupoId, ativo: true, NOT: { id: produto.id } },
        take: 8,
        include: { cores: { where: { ativo: true }, include: { imagens: { orderBy: { ordem: "asc" } } } } },
      })
    : [];

  const similares = similaresBrutos.map(p => ({
    id: p.id,
    nome: p.nome,
    codigo: p.codigo,
    precoVista: getPreco(p as any, "VAREJO", "VISTA"),
    imagemUrl: (p as any).imagemPrincipal ?? p.cores[0]?.imagens.find((i: any) => i.principal)?.url ?? p.cores[0]?.imagens[0]?.url ?? null,
    totalCores: p.cores.length,
  }));

  return (
    <ProdutoDetalheVarejo
      produto={{
        id: produto.id,
        codigo: produto.codigo,
        nome: produto.nome,
        descricao: produto.descricao,
        descricaoCompleta: (produto as any).descricaoCompleta ?? null,
        imagemPrincipal: (produto as any).imagemPrincipal ?? null,
        videoUrl: produto.videoUrl,
        tabelaMedidas: (produto as any).tabelaMedidas ?? null,
        precoVista: getPreco(produto as any, "VAREJO", "VISTA"),
        precoPrazo: getPreco(produto as any, "VAREJO", "PRAZO"),
        cores: produto.cores,
      }}
      catalogo="VAREJO"
      vendedorSlug={vendedorSlug}
      similares={similares}
    />
  );
}
