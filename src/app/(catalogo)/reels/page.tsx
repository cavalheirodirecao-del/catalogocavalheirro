import { prisma } from "@/lib/prisma";

export default async function ReelsPage() {
  const produtos = await prisma.produto.findMany({ where: { ativo: true, videoUrl: { not: null } }, select: { id: true, nome: true, codigo: true, videoUrl: true }, orderBy: { criadoEm: "desc" } });
  return <main className="h-screen overflow-y-auto snap-y snap-mandatory bg-black">{produtos.flatMap(p => (p.videoUrl ?? "").split("\n").filter(Boolean).map((url, i) => <section key={`${p.id}-${i}`} className="h-screen snap-start relative flex items-center justify-center"><iframe src={url.includes("youtube") ? url.replace("watch?v=", "embed/") : url} className="h-full w-full max-w-md" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /><div className="absolute bottom-8 left-5 text-white drop-shadow-lg"><p className="font-semibold">{p.nome}</p><p className="text-sm opacity-80">{p.codigo}</p></div></section>))}</main>;
}
