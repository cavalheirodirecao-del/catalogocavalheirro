"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, EyeOff, Star } from "lucide-react";

function formatData(d: string) {
  return new Date(d).toLocaleDateString("pt-BR");
}

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletando, setDeletando] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/blog?admin=1")
      .then((r) => r.json())
      .then((data) => { setPosts(data); setLoading(false); });
  }, []);

  async function deletar(id: string) {
    if (!confirm("Excluir este post?")) return;
    setDeletando(id);
    await fetch(`/api/blog/${id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setDeletando(null);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
          <p className="text-sm text-gray-500 mt-1">
            {posts.length} post{posts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/posts/novo"
          className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Plus size={16} /> Novo post
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-16 text-center">
          <p className="text-gray-400 text-lg mb-4">Nenhum post ainda.</p>
          <Link
            href="/posts/novo"
            className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg"
          >
            <Plus size={15} /> Criar primeiro post
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
              {/* imagem thumb */}
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {post.imagemCapa ? (
                  <img
                    src={post.imagemCapa}
                    alt={post.titulo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-bold">
                    IMG
                  </div>
                )}
              </div>

              {/* info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-gray-900 truncate">{post.titulo}</p>
                  {post.destaque && (
                    <Star size={13} className="text-yellow-500 fill-yellow-400 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-400 truncate">
                  /{post.slug} · {formatData(post.publicadoEm ?? post.criadoEm)}
                  {post.autor ? ` · ${post.autor}` : ""}
                </p>
              </div>

              {/* status */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {post.publicado ? (
                  <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                    <Eye size={11} /> Publicado
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                    <EyeOff size={11} /> Rascunho
                  </span>
                )}
              </div>

              {/* ações */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link
                  href={`/posts/${post.id}`}
                  className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Pencil size={15} />
                </Link>
                <button
                  onClick={() => deletar(post.id)}
                  disabled={deletando === post.id}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                  title="Excluir"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
