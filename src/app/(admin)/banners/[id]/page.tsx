"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ImageUpload from "@/components/admin/ImageUpload";
import { Video } from "lucide-react";

function getYoutubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1&mute=1&loop=1&playlist=${m[1]}` : null;
}

export default function EditarBannerPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/banners/${id}`)
      .then(r => r.json())
      .then(data => setForm({
        ...data,
        titulo: data.titulo ?? "",
        subtitulo: data.subtitulo ?? "",
        imagemDesktop: data.imagemDesktop ?? data.imagemUrl ?? "",
        imagemTablet: data.imagemTablet ?? "",
        imagemMobile: data.imagemMobile ?? "",
        videoUrl: data.videoUrl ?? "",
        linkUrl: data.linkUrl ?? "",
      }))
      .finally(() => setLoading(false));
  }, [id]);

  function set(field: string, value: any) {
    setForm((f: any) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSaving(true);
    try {
      const res = await fetch(`/api/banners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/banners");
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Excluir este banner?")) return;
    await fetch(`/api/banners/${id}`, { method: "DELETE" });
    router.push("/banners");
  }

  if (loading) return <div className="text-gray-400 p-8">Carregando...</div>;
  if (!form) return <div className="text-red-500 p-8">Banner não encontrado.</div>;

  const embedUrl = getYoutubeEmbedUrl(form.videoUrl);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Editar Banner</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
        {erro && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{erro}</p>}

        {/* Configurações gerais */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catálogo</label>
            <select value={form.catalogo} onChange={e => set("catalogo", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
              <option value="VAREJO">Varejo</option>
              <option value="ATACADO">Atacado</option>
              <option value="FABRICA">Fábrica</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
            <input type="number" min={0} value={form.ordem} onChange={e => set("ordem", Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input type="text" value={form.titulo} onChange={e => set("titulo", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
            <input type="text" value={form.subtitulo} onChange={e => set("subtitulo", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link ao clicar</label>
          <input type="text" value={form.linkUrl} onChange={e => set("linkUrl", e.target.value)}
            placeholder="https://..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
        </div>

        {/* Imagens por dispositivo */}
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-3 border-b pb-2">Imagens por Dispositivo</p>
          <div className="grid grid-cols-3 gap-3">
            <ImageUpload
              label="Desktop"
              aspect="banner-desktop"
              value={form.imagemDesktop}
              onChange={v => set("imagemDesktop", v)}
            />
            <ImageUpload
              label="Tablet"
              aspect="banner-tablet"
              value={form.imagemTablet}
              onChange={v => set("imagemTablet", v)}
            />
            <ImageUpload
              label="Mobile"
              aspect="banner-mobile"
              value={form.imagemMobile}
              onChange={v => set("imagemMobile", v)}
            />
          </div>
        </div>

        {/* Vídeo YouTube */}
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-3 border-b pb-2">Vídeo (YouTube Shorts)</p>
          <div className="flex items-center gap-2 mb-3">
            <Video size={16} className="text-red-500 shrink-0" />
            <input type="text" value={form.videoUrl} onChange={e => set("videoUrl", e.target.value)}
              placeholder="https://youtube.com/shorts/..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
          {embedUrl && (
            <div className="rounded-lg overflow-hidden bg-black aspect-video">
              <iframe src={embedUrl} className="w-full h-full" allow="autoplay; muted" allowFullScreen />
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1">O vídeo substitui as imagens quando disponível.</p>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="ativo" checked={form.ativo} onChange={e => set("ativo", e.target.checked)} />
          <label htmlFor="ativo" className="text-sm text-gray-700">Banner ativo</label>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={handleDelete}
            className="px-4 border border-red-200 text-red-600 rounded-lg py-2 text-sm hover:bg-red-50 transition">
            Excluir
          </button>
          <button type="button" onClick={() => router.back()}
            className="flex-1 border border-gray-200 rounded-lg py-2 text-sm hover:bg-gray-50 transition">
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 bg-black text-white rounded-lg py-2 text-sm hover:bg-gray-800 transition disabled:opacity-50">
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
