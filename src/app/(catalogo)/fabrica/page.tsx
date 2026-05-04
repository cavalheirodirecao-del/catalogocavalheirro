import { prisma } from "@/lib/prisma";

export const revalidate = 300;
import { notFound } from "next/navigation";
import CatalogoClient from "@/components/catalogo/CatalogoClient";
import { headers } from "next/headers";
import { logVisita } from "@/lib/visitas";

interface Props {
  searchParams: { vendedor?: string; ref?: string };
}

export default async function FabricaPage({ searchParams }: Props) {
  const vendedorSlug = searchParams.vendedor ?? null;
  const afiliadoSlug = searchParams.ref ?? null;

  let vendedorNome: string | null = null;
  if (vendedorSlug) {
    const vendedor = await prisma.vendedor.findUnique({
      where: { slug: vendedorSlug },
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
        grupo: true,
        subGrupo: true,
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

  const ip = headers().get("x-forwarded-for")?.split(",")[0].trim() ?? null;
  logVisita("FABRICA", ip, vendedorSlug, afiliadoSlug).catch(() => {});

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
