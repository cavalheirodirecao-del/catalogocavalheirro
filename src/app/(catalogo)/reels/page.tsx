import { prisma } from "@/lib/prisma";
import ReelsClient from "@/components/catalogo/ReelsClient";

export const dynamic = "force-dynamic";

export default async function ReelsPage() {
  const produtos = await prisma.produto.findMany({ where: { ativo: true, videoUrl: { not: null } }, select: { id: true, nome: true, codigo: true, videoUrl: true, imagemPrincipal: true, precoVarejoVista: true }, orderBy: { atualizadoEm: "desc" }, take: 30 });
  const videos = produtos.flatMap(p => (p.videoUrl ?? "").split("\n").filter(Boolean).map((url, i) => ({ id: `${p.id}-${i}`, url, produtoId: p.id, nome: p.nome, codigo: p.codigo, imagem: p.imagemPrincipal, preco: Number(p.precoVarejoVista) })));
  return <ReelsClient videos={videos} />;
}
