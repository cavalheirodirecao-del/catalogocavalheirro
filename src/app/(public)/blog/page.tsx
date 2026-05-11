import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Calendar, User, ArrowRight, Tag } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog — Cavalheiro Jeanswear",
  description:
    "Dicas de moda, tendências do jeanswear e novidades da Cavalheiro. Tudo sobre o estilo do Polo do Agreste Pernambucano.",
  openGraph: {
    title: "Blog — Cavalheiro Jeanswear",
    description:
      "Dicas de moda, tendências do jeanswear e novidades da Cavalheiro.",
    type: "website",
  },
};

export const revalidate = 60; // revalida a cada 60s (ISR)

async function getPosts() {
  return prisma.postBlog.findMany({
    where: { publicado: true },
    orderBy: [{ destaque: "desc" }, { publicadoEm: "desc" }, { criadoEm: "desc" }],
    select: {
      id: true,
      titulo: true,
      slug: true,
      resumo: true,
      imagemCapa: true,
      autor: true,
      destaque: true,
      palavrasChave: true,
      publicadoEm: true,
      criadoEm: true,
    },
  });
}

function formatData(d: Date | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPage() {
  const posts = await getPosts();
  const destaque = posts.find((p) => p.destaque) ?? posts[0];
  const demais = posts.filter((p) => p.id !== destaque?.id);

  if (posts.length === 0) {
    return (
      <main className="min-h-screen bg-[#0A0A0A] text-white">
        <div className="max-w-5xl mx-auto px-6 py-32 text-center">
          <p className="font-bebas text-6xl text-[#B8954A] mb-4">EM BREVE</p>
          <p className="font-dm-sans text-white/50 text-lg">
            Estamos preparando conteúdo incrível para você.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <section className="border-b border-white/8 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="font-dm-sans text-[#B8954A] text-sm tracking-[0.3em] uppercase mb-3">
            Blog
          </p>
          <h1 className="font-bebas text-6xl md:text-8xl text-white leading-none">
            MODA &amp; CULTURA
          </h1>
          <p className="font-dm-sans text-white/50 mt-4 text-lg max-w-xl">
            Tendências, bastidores e o DNA do jeanswear nordestino.
          </p>
        </div>
      </section>

      {/* Post em destaque */}
      {destaque && (
        <section className="max-w-5xl mx-auto px-6 py-12">
          <Link href={`/blog/${destaque.slug}`} className="group block">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* imagem */}
              <div className="relative overflow-hidden rounded-sm aspect-[16/10] bg-white/5">
                {destaque.imagemCapa ? (
                  <img
                    src={destaque.imagemCapa}
                    alt={destaque.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-bebas text-5xl text-white/10">CAVALHEIRO</span>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="bg-[#B8954A] text-black font-dm-sans text-xs font-semibold px-3 py-1 rounded-sm tracking-widest uppercase">
                    Destaque
                  </span>
                </div>
              </div>

              {/* texto */}
              <div>
                <div className="flex items-center gap-3 text-white/40 text-sm font-dm-sans mb-4">
                  <Calendar size={14} />
                  <span>{formatData(destaque.publicadoEm ?? destaque.criadoEm)}</span>
                  {destaque.autor && (
                    <>
                      <span>·</span>
                      <User size={14} />
                      <span>{destaque.autor}</span>
                    </>
                  )}
                </div>
                <h2 className="font-bebas text-4xl md:text-5xl text-white leading-none mb-4 group-hover:text-[#B8954A] transition-colors duration-300">
                  {destaque.titulo}
                </h2>
                {destaque.resumo && (
                  <p className="font-dm-sans text-white/60 text-base leading-relaxed mb-6">
                    {destaque.resumo}
                  </p>
                )}
                <span className="inline-flex items-center gap-2 font-dm-sans text-[#B8954A] text-sm tracking-widest uppercase group-hover:gap-4 transition-all duration-300">
                  Ler artigo <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Divider */}
      {demais.length > 0 && (
        <div className="max-w-5xl mx-auto px-6">
          <div className="border-t border-white/8 pt-10 mb-8">
            <p className="font-dm-sans text-white/30 text-xs tracking-[0.3em] uppercase">
              Mais artigos
            </p>
          </div>
        </div>
      )}

      {/* Grid de posts */}
      {demais.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {demais.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col"
              >
                {/* imagem */}
                <div className="relative overflow-hidden rounded-sm aspect-[4/3] bg-white/5 mb-5">
                  {post.imagemCapa ? (
                    <img
                      src={post.imagemCapa}
                      alt={post.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-bebas text-3xl text-white/10">CAVALHEIRO</span>
                    </div>
                  )}
                </div>

                {/* meta */}
                <div className="flex items-center gap-2 text-white/30 text-xs font-dm-sans mb-2">
                  <Calendar size={12} />
                  <span>{formatData(post.publicadoEm ?? post.criadoEm)}</span>
                </div>

                {/* título */}
                <h3 className="font-bebas text-2xl text-white leading-tight mb-2 group-hover:text-[#B8954A] transition-colors duration-300">
                  {post.titulo}
                </h3>

                {/* resumo */}
                {post.resumo && (
                  <p className="font-dm-sans text-white/50 text-sm leading-relaxed flex-1">
                    {post.resumo.length > 120
                      ? post.resumo.slice(0, 120) + "…"
                      : post.resumo}
                  </p>
                )}

                {/* tags */}
                {post.palavrasChave && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {post.palavrasChave
                      .split(",")
                      .slice(0, 3)
                      .map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 text-[10px] font-dm-sans text-white/30 border border-white/10 px-2 py-0.5 rounded-sm"
                        >
                          <Tag size={9} />
                          {tag.trim()}
                        </span>
                      ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
