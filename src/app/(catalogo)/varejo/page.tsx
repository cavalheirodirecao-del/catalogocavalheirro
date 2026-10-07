import { prisma } from "@/lib/prisma";
import CatalogoClient from "@/components/catalogo/CatalogoClient";

export const revalidate = 300;

interface Props {
  searchParams: { vendedor?: string; ref?: string };
}

export default async function VarejoPage({ searchParams }: Props) {
  const vendedorSlug  = searchParams.vendedor ?? null;

  let vendedorNome: string | null = null;
  if (vendedorSlug) {
    const vendedor = await prisma.vendedor.findUnique({
      where: { slug: vendedorSlug, ativo: true, usuario: { ativo: true } },
      include: { usuario: true },
    });
    vendedorNome = vendedor?.usuario.nome ?? null;
  }

  const [config, banners, produtos, grupos] = await Promise.all([
    prisma.configuracaoCatalogo.findUnique({ where: { catalogo: "VAREJO" } }),
    prisma.banner.findMany({
      where: { catalogo: "VAREJO", ativo: true },
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
    (prisma as any).grupo.findMany({
      where: { ativo: true },
      select: { id: true, nome: true, bannerUrl: true, imagemUrl: true },
      orderBy: { nome: "asc" },
    }),
  ]);


  return (
    <CatalogoClient
      produtos={produtos.map(p => ({ ...p, precoFabricaVista: 0, precoFabricaPrazo: 0 })) as any}
      catalogo="VAREJO"
      vendedorSlug={vendedorSlug}
      vendedorNome={vendedorNome}
      banners={banners}
      config={config}
      qtdMinima={1}
      pathCatalogo="varejo"
      grupos={grupos}
    />
  );
}
