import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function RevendedoresPage() {
  // Busca capas, produtos e configuração em paralelo
  const [configuracoes, produtos, configGeral] = await Promise.all([
    prisma.configuracaoCatalogo.findMany({
      where: { catalogo: { in: ["VAREJO", "ATACADO", "FABRICA"] } },
      select: { catalogo: true, imagemCapa: true },
    }),
    prisma.produto.findMany({
      where: { ativo: true },
      include: {
        cores: {
          where: { ativo: true },
          include: { imagens: { orderBy: { ordem: "asc" }, take: 1 } },
          take: 1,
        },
      },
      orderBy: { criadoEm: "desc" },
      take: 10,
    }),
    prisma.configuracaoGeral.findFirst(),
  ]);

  const qtdAtacado = configGeral?.qtdMinimaAtacado ?? 15;
  const qtdFabrica = configGeral?.qtdMinimaFabrica ?? 40;

  const CATALOGOS = [
    {
      href: "/varejo",
      tipo: "VAREJO" as const,
      label: "Varejo",
      desc: "Compra unitária, sem mínimo. Moda masculina com qualidade Toritama.",
      cor: "#FF4D00",
      corBg: "#1C1C1A",
      badge: "B2C",
    },
    {
      href: "/atacado",
      tipo: "ATACADO" as const,
      label: "Atacado Revenda",
      desc: `Para lojistas e revendedores. Mínimo de ${qtdAtacado} peças sortidas, preços especiais.`,
      cor: "#B8965A",
      corBg: "#F4EFE6",
      badge: "B2B",
    },
    {
      href: "/fabrica",
      tipo: "FABRICA" as const,
      label: "Atacado Grandes Clientes",
      desc: `Acima de ${qtdFabrica} peças. Preço diferenciado direto da produção.`,
      cor: "#F5C400",
      corBg: "#0E1117",
      badge: "B2B",
    },
  ];

  const capaMap = Object.fromEntries(
    configuracoes.map(c => [c.catalogo, c.imagemCapa])
  );

  const comFoto = produtos.filter(
    (p) => p.imagemPrincipal || p.cores[0]?.imagens[0]?.url
  );

  function getProdutoImg(idx: number) {
    const p = comFoto[idx] ?? produtos[idx] ?? null;
    if (!p) return null;
    return p.imagemPrincipal ?? p.cores[0]?.imagens[0]?.url ?? null;
  }

  return (
    <div className="bg-[#0E1117] min-h-screen">
      {/* Hero */}
      <section className="relative pt-20 pb-14 px-4 text-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="font-space-mono text-xs tracking-[0.4em] text-white/30 uppercase mb-4">
            Catálogos Cavalheiro
          </p>
          <h1 className="font-bebas text-[clamp(3.5rem,12vw,8rem)] leading-none tracking-[0.06em] text-white mb-6">
            ESCOLHA SEU CATÁLOGO
          </h1>
          <p className="text-base text-white/40 font-dm-sans max-w-lg mx-auto">
            Do varejo ao grande volume — temos o preço certo para o seu modelo de negócio.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="bg-[#F8F8F6] py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {CATALOGOS.map((cat, i) => {
              // Usa imagemCapa do catálogo se definida, senão fallback para foto de produto
              const img = capaMap[cat.tipo] ?? getProdutoImg(i);

              return (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className="group relative overflow-hidden rounded-2xl aspect-[3/4] flex flex-col justify-end"
                  style={{ backgroundColor: cat.corBg }}
                >
                  {img && (
                    <img
                      src={img}
                      alt={cat.label}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute top-4 right-4">
                    <span
                      className="text-[10px] font-space-mono tracking-widest px-2 py-0.5 rounded-full border"
                      style={{
                        color: cat.cor,
                        borderColor: cat.cor + "60",
                        backgroundColor: cat.cor + "15",
                      }}
                    >
                      {cat.badge}
                    </span>
                  </div>

                  <div className="relative z-10 p-6">
                    <p className="font-dm-sans font-black text-3xl text-white mb-2">{cat.label}</p>
                    <p className="text-sm text-white/60 font-dm-sans leading-relaxed mb-4">
                      {cat.desc}
                    </p>
                    <span
                      className="inline-flex items-center gap-1.5 text-sm font-semibold font-dm-sans group-hover:gap-2.5 transition-all"
                      style={{ color: cat.cor }}
                    >
                      Acessar catálogo <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
