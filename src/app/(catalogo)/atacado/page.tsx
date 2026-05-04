import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import CatalogoClient from "@/components/catalogo/CatalogoClient";

export const revalidate = 300;
import { headers } from "next/headers";
import { logVisita } from "@/lib/visitas";

interface Props {
  searchParams: { vendedor?: string; ref?: string };
}

export default async function AtacadoPage({ searchParams }: Props) {
  const vendedorSlug = searchParams.vendedor ?? null;
  const afiliadoSlug = searchParams.ref ?? null;

  // Valida vendedor se informado
  let vendedorNome: string | null = null;
  if (vendedorSlug) {
    const vendedor = await prisma.vendedor.findUnique({
      where: { slug: vendedorSlug },
      include: {
        usuario: true,
        links: { where: { catalogo: "ATACADO", ativo: true } },
      },
    });
    if (!vendedor || vendedor.links.length === 0) notFound();
    vendedorNome = vendedor.usuario.nome;
  }

  const [config, banners, produtos, configGeral, grupos] = await Promise.all([
    prisma.configuracaoCatalogo.findUnique({ where: { catalogo: "ATACADO" } }),
    prisma.banner.findMany({
      where: { catalogo: "ATACADO", ativo: true },
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

  // Log da visita (fire-and-forget)
  const ip = headers().get("x-forwarded-for")?.split(",")[0].trim() ?? null;
  logVisita("ATACADO", ip, vendedorSlug, afiliadoSlug).catch(() => {});

  return (
    <CatalogoClient
      produtos={produtos as any}
      catalogo="ATACADO"
      vendedorSlug={vendedorSlug}
      vendedorNome={vendedorNome}
      banners={banners}
      config={config}
      qtdMinima={configGeral?.qtdMinimaAtacado ?? 15}
      pathCatalogo="atacado"
      grupos={grupos}
    />
  );
}
