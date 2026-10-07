import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
import { notFound } from "next/navigation";
import CatalogoClient from "@/components/catalogo/CatalogoClient";

interface Props {
  searchParams: { vendedor?: string; ref?: string };
}

export default async function FabricaPage({ searchParams }: Props) {
  const vendedorSlug = searchParams.vendedor ?? null;

  let vendedorNome: string | null = null;
  if (vendedorSlug) {
    const vendedor = await prisma.vendedor.findUnique({
      where: { slug: vendedorSlug, ativo: true, usuario: { ativo: true } },
      include: {
        usuario: true,
        links: { where: { catalogo: "FABRICA", ativo: true } },
      },
    });
    if (!vendedor || vendedor.links.length === 0) notFound();
    vendedorNome = vendedor.usuario.nome;
  }

  const [config, banners, produtos, configGeral, grupos] = await Promise.all([
    prisma.configuracaoCatalogo.findUnique({ where: { catalogo: "FABRICA" } }),
    prisma.banner.findMany({
      where: { catalogo: "FABRICA", ativo: true },
      orderBy: { ordem: "asc" },
    }),
    prisma.produto.findMany({
      where: { ativo: true },
      include: {
        grupo: { select: { id: true, nome: true, imagemUrl: true, bannerUrl: true, ativo: true } },
        subGrupo: { select: { id: true, nome: true, grupoId: true, ativo: true } },
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
      orderBy: { nome: "asc" },
    }),
    prisma.configuracaoGeral.findFirst(),
    (prisma as any).grupo.findMany({
      where: { ativo: true },
      select: { id: true, nome: true, bannerUrl: true, imagemUrl: true },
      orderBy: { nome: "asc" },
    }),
  ]);


  return (
    <CatalogoClient
      produtos={produtos as any}
      catalogo="FABRICA"
      vendedorSlug={vendedorSlug}
      vendedorNome={vendedorNome}
      banners={banners}
      config={config}
      qtdMinima={configGeral?.qtdMinimaFabrica ?? 40}
      pathCatalogo="fabrica"
      grupos={grupos}
    />
  );
}
