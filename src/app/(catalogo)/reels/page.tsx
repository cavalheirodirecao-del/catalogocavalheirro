import { prisma } from "@/lib/prisma";
import ReelsClient from "@/components/catalogo/ReelsClient";

export const dynamic = "force-dynamic";

export default async function ReelsPage({ searchParams }: { searchParams: { catalogo?: string } }) {
  const catalogo = ["VAREJO", "ATACADO", "FABRICA"].includes(searchParams.catalogo ?? "") ? searchParams.catalogo! : "VAREJO";
  const [videosCadastrados, produtosLegados] = await Promise.all([
    prisma.videoProduto.findMany({ where: { ativo: true, statusProcessamento: "PRONTO", produto: { ativo: true } }, include: { produto: { select: { id: true, nome: true, codigo: true, imagemPrincipal: true, precoVarejoVista: true, precoAtacadoVista: true, precoFabricaVista: true } } }, orderBy: { ordem: "asc" }, take: 100 }),
    prisma.produto.findMany({ where: { ativo: true, videoUrl: { not: null } }, select: { id: true, nome: true, codigo: true, imagemPrincipal: true, videoUrl: true, precoVarejoVista: true, precoAtacadoVista: true, precoFabricaVista: true }, take: 100 }),
  ]);
  const videos = videosCadastrados.filter(v => { const canais = Array.isArray(v.canais) ? v.canais.map(String) : []; return canais.length === 0 || canais.includes(catalogo); }).map(v => ({ id: v.id, url: v.cdnUrl, produtoId: v.produto.id, nome: v.produto.nome, codigo: v.produto.codigo, imagem: v.thumbnailUrl ?? v.produto.imagemPrincipal, preco: Number(catalogo === "ATACADO" ? v.produto.precoAtacadoVista : catalogo === "FABRICA" ? v.produto.precoFabricaVista : v.produto.precoVarejoVista) }));
  const ids = new Set(videos.map(v => v.produtoId));
  for (const p of produtosLegados) {
    if (ids.has(p.id) || !p.videoUrl) continue;
    for (const [i, url] of Array.from(p.videoUrl.split("\n").map(v => v.trim()).filter(Boolean).entries())) videos.push({ id: `legacy-${p.id}-${i}`, url, produtoId: p.id, nome: p.nome, codigo: p.codigo, imagem: p.imagemPrincipal, preco: Number(catalogo === "ATACADO" ? p.precoAtacadoVista : catalogo === "FABRICA" ? p.precoFabricaVista : p.precoVarejoVista) });
  }
  return <ReelsClient videos={videos} catalogo={catalogo.toLowerCase()} />;
}
