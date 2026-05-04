import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Calendar, User, ArrowLeft, Tag } from "lucide-react";

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

async function getPost(slug: string) {
  return prisma.postBlog.findFirst({
    where: { slug, publicado: true },
  });
}

// SEO dinâmico por post
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "Post não encontrado" };

  return {
    title: `${post.titulo} — Cavalheiro Jeanswear`,
    description: post.resumo ?? `Leia ${post.titulo} no blog da Cavalheiro.`,
    keywords: post.palavrasChave ?? undefined,
    authors: post.autor ? [{ name: post.autor }] : undefined,
    openGraph: {
      title: post.titulo,
      description: post.resumo ?? `Leia ${post.titulo} no blog da Cavalheiro.`,
      type: "article",
      publishedTime: post.publicadoEm?.toISOString(),
      images: post.imagemCapa ? [{ url: post.imagemCapa }] : [],
    },
  };
}

// Remove inline color/background styles que tornam o texto invisível no fundo escuro.
// Preserva width/height (usados para redimensionar imagens no editor).
function limparCoresInline(html: string): string {
  return html.replace(/style="([^"]*)"/gi, (_, estilos: string) => {
    const filtrado = estilos
      .split(";")
      .map((s: string) => s.trim())
      .filter((s: string) => s && !s.match(/^(color|background-color|background|font-family)\s*:/i))
      .join("; ");
    return filtrado ? `style="${filtrado}"` : "";
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

export default async function BlogPostPage({ params }: Props) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  // JSON-LD estruturado para Google e IA
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.titulo,
    description: post.resumo ?? "",
    image: post.imagemCapa ?? "",
    author: {
      "@type": "Person",
      name: post.autor ?? "Equipe Cavalheiro",
    },
    publisher: {
      "@type": "Organization",
      name: "Cavalheiro Jeanswear",
      logo: {
        "@type": "ImageObject",
        url: "/logo.png",
      },
    },
    datePublished: post.publicadoEm?.toISOString() ?? post.criadoEm.toISOString(),
    dateModified: post.atualizadoEm.toISOString(),
    keywords: post.palavrasChave ?? "",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `/blog/${post.slug}`,
    },
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-[#0A0A0A] text-white">
        {/* Hero com imagem de capa */}
        {post.imagemCapa && (
          <div className="relative h-[50vh] min-h-[360px] overflow-hidden">
            <img
              src={post.imagemCapa}
              alt={post.titulo}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-[#0A0A0A]" />
          </div>
        )}

        <article className="max-w-2xl mx-auto px-6 pb-24">
          {/* Voltar */}
          <div className={post.imagemCapa ? "-mt-6 mb-8" : "pt-16 mb-8"}>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 font-dm-sans text-white/40 hover:text-[#B8954A] text-sm transition-colors"
            >
              <ArrowLeft size={14} /> Voltar ao blog
            </Link>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-white/40 text-sm font-dm-sans mb-6">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              {formatData(post.publicadoEm ?? post.criadoEm)}
            </span>
            {post.autor && (
              <>
                <span className="text-white/20">·</span>
                <span className="flex items-center gap-1.5">
                  <User size={13} /> {post.autor}
                </span>
              </>
            )}
          </div>

          {/* Título */}
          <h1 className="font-bebas text-5xl md:text-7xl text-white leading-none mb-8">
            {post.titulo}
          </h1>

          {/* Resumo */}
          {post.resumo && (
            <p className="font-cormorant text-2xl text-[#D4AF7A] italic leading-relaxed mb-10 border-l-2 border-[#B8954A] pl-5">
              {post.resumo}
            </p>
          )}

          {/* Linha divisória */}
          <div className="border-t border-white/8 mb-10" />

          {/* Conteúdo HTML */}
          <div
            className="prose prose-invert prose-lg max-w-none
              prose-headings:font-bebas prose-headings:text-white prose-headings:font-normal
              prose-h2:text-4xl prose-h3:text-3xl
              prose-p:font-dm-sans prose-p:text-white/70 prose-p:leading-relaxed
              prose-a:text-[#B8954A] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-white prose-strong:font-semibold
              prose-blockquote:border-[#B8954A] prose-blockquote:text-white/60 prose-blockquote:font-cormorant prose-blockquote:text-xl
              prose-img:rounded-sm prose-img:max-w-full
              prose-ul:text-white/70 prose-ol:text-white/70
              prose-li:font-dm-sans prose-li:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: limparCoresInline(post.conteudo) }}
          />

          {/* Tags */}
          {post.palavrasChave && (
            <div className="mt-12 pt-8 border-t border-white/8">
              <p className="font-dm-sans text-xs text-white/30 tracking-widest uppercase mb-3">
                Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {post.palavrasChave.split(",").map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 font-dm-sans text-xs text-white/40 border border-white/10 px-3 py-1 rounded-sm"
                  >
                    <Tag size={10} />
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA rodapé */}
          <div className="mt-16 p-8 border border-[#B8954A]/30 rounded-sm text-center">
            <p className="font-bebas text-3xl text-white mb-2">
              CONHEÇA A CAVALHEIRO
            </p>
            <p className="font-dm-sans text-white/50 text-sm mb-5">
              Jeanswear do Polo do Agreste Pernambucano para todo o Brasil.
            </p>
            <Link
              href="/varejo"
              className="inline-block bg-[#B8954A] hover:bg-[#9A7A38] text-black font-dm-sans font-semibold text-sm px-6 py-2.5 rounded-sm transition-colors"
            >
              Ver catálogo
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}
