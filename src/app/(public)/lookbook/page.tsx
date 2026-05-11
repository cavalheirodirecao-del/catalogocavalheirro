import { prisma } from "@/lib/prisma";
import LookbookClient from "@/components/lookbook/LookbookClient";

export const dynamic = "force-dynamic";

export default async function LookbookPage() {
  const produtos = await prisma.produto.findMany({
    where: { ativo: true },
    include: {
      cores: {
        where: { ativo: true },
        include: { imagens: { orderBy: { ordem: "asc" }, take: 1 } },
        take: 1,
      },
      grupo: true,
    },
    orderBy: { criadoEm: "desc" },
    take: 60,
  });

  const produtosFormatados = produtos.map((p) => ({
    id: p.id,
    nome: p.nome,
    grupo: p.grupo ? { nome: p.grupo.nome } : null,
    precoVarejoVista: Number(p.precoVarejoVista),
    precoAtacadoVista: Number(p.precoAtacadoVista),
    precoFabricaVista: Number(p.precoFabricaVista),
    img:
      p.imagemPrincipal ??
      p.cores[0]?.imagens[0]?.url ??
      null,
  }));

  return (
    <div className="bg-[#0E1117] min-h-screen">
      {/* Hero */}
      <section className="relative pt-20 pb-16 px-4 text-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative z-10">
          <p className="font-space-mono text-xs tracking-[0.4em] text-white/30 uppercase mb-4">
            Coleção Cavalheiro
          </p>
          <h1 className="font-bebas text-[clamp(4rem,15vw,12rem)] leading-none tracking-[0.08em] text-white">
            LOOKBOOK
          </h1>
          <p className="mt-4 text-base text-white/40 font-dm-sans max-w-md mx-auto">
            Explore nossa coleção. Clique em qualquer foto para ampliar.
          </p>
        </div>
      </section>

      {/* Grid + filtros (client) */}
      <LookbookClient produtos={produtosFormatados} />
    </div>
  );
}
