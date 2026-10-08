import { prisma } from "@/lib/prisma";
import ReelsClient from "@/components/catalogo/ReelsClient";

export const dynamic = "force-dynamic";

export default async function ReelsPage({ searchParams }: { searchParams: { catalogo?: string } }) {
  const catalogo = ["VAREJO", "ATACADO", "FABRICA"].includes(searchParams.catalogo ?? "") ? searchParams.catalogo! : "VAREJO";
  const videosCadastrados = await prisma.videoProduto.findMany({ where: { ativo: true, statusProcessamento: "PRONTO", produto: { ativo: true } }, include: { produto: { select: { id: true, nome: true, codigo: true, imagemPrincipal: true, precoVarejoVista: true, precoAtacadoVista: true, precoFabricaVista: true } } }, orderBy: { ordem: "asc" }, take: 100 });
  const videos = videosCadastrados.filter(v => { const canais = Array.isArray(v.canais) ? v.canais.map(String) : []; return canais.length === 0 || canais.includes(catalogo); }).map(v => ({ id: v.id, url: v.cdnUrl, produtoId: v.produto.id, nome: v.produto.nome, codigo: v.produto.codigo, imagem: v.thumbnailUrl ?? v.produto.imagemPrincipal, preco: Number(catalogo === "ATACADO" ? v.produto.precoAtacadoVista : catalogo === "FABRICA" ? v.produto.precoFabricaVista : v.produto.precoVarejoVista) }));
  return <ReelsClient videos={videos} catalogo={catalogo.toLowerCase()} />;
}
