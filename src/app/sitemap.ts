import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL, publicPages } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([
    prisma.produto.findMany({ where: { ativo: true }, select: { id: true, atualizadoEm: true } }),
    prisma.postBlog.findMany({ where: { publicado: true }, select: { slug: true, atualizadoEm: true } }),
  ]);
  return [
    ...Object.keys(publicPages).map(path => ({ url: `${SITE_URL}/${path}` })),
    ...products.flatMap(product => ["varejo", "atacado"].map(catalog => ({ url: `${SITE_URL}/${catalog}/produto/${product.id}`, lastModified: product.atualizadoEm }))),
    ...posts.map(post => ({ url: `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`, lastModified: post.atualizadoEm })),
  ];
}
