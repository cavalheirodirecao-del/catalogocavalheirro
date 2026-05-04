"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, ChevronDown, Image as ImageIcon } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

interface Banner {
  id: string;
  catalogo: string;
  titulo: string | null;
  subtitulo: string | null;
  imagemDesktop: string | null;
  imagemTablet: string | null;
  imagemMobile: string | null;
  videoUrl: string | null;
  ativo: boolean;
  ordem: number;
}

const CATALOGOS = [
  {
    tipo: "VAREJO",
    label: "Varejo",
    desc: "Compra unitária, B2C",
    badge: "B2C",
    corBadge: "bg-red-100 text-red-700",
    acento: "#FF4D00",
  },
  {
    tipo: "ATACADO",
    label: "Atacado Revenda",
    desc: "Para lojistas, mín. 15 peças",
    badge: "B2B",
    corBadge: "bg-amber-100 text-amber-700",
    acento: "#B8965A",
  },
  {
    tipo: "FABRICA",
    label: "Atacado Grandes Clientes",
    desc: "+40 peças, preço diferenciado",
    badge: "B2B",
    corBadge: "bg-yellow-100 text-yellow-700",
    acento: "#F5C400",
  },
] as const;

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [capas, setCapas] = useState<Record<string, string | null>>({
    VAREJO: null, ATACADO: null, FABRICA: null,
  });
  const [capaTemp, setCapaTemp] = useState<Record<string, string | null>>({
    VAREJO: null, ATACADO: null, FABRICA: null,
  });
  const [salvandoCapa, setSalvandoCapa] = useState<string | null>(null);
  const [secoesAbertas, setSecoesAbertas] = useState<Record<string, boolean>>({
    VAREJO: true, ATACADO: false, FABRICA: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    const [bannersData, configVarejo, configAtacado, configFabrica] = await Promise.all([
      fetch("/api/banners").then(r => r.json()),
      fetch("/api/configuracoes-catalogo/VAREJO").then(r => r.json()),
      fetch("/api/configuracoes-catalogo/ATACADO").then(r => r.json()),
      fetch("/api/configuracoes-catalogo/FABRICA").then(r => r.json()),
    ]);

    setBanners(bannersData);

    const novasCapas = {
      VAREJO: configVarejo?.imagemCapa ?? null,
      ATACADO: configAtacado?.imagemCapa ?? null,
      FABRICA: configFabrica?.imagemCapa ?? null,
    };
    setCapas(novasCapas);
    setCapaTemp(novasCapas);
    setLoading(false);
  }

  async function salvarCapa(tipo: string) {
    setSalvandoCapa(tipo);
    await fetch(`/api/configuracoes-catalogo/${tipo}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imagemCapa: capaTemp[tipo] }),
    });
    setCapas(c => ({ ...c, [tipo]: capaTemp[tipo] }));
    setSalvandoCapa(null);
  }

  function toggleSecao(tipo: string) {
    setSecoesAbertas(s => ({ ...s, [tipo]: !s[tipo] }));
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Banners</h1>
        <p className="text-gray-500 text-sm">Banners e foto de capa por catálogo</p>
      </div>

      <div className="space-y-4">
        {CATALOGOS.map(cat => {
          const bannersDoTipo = banners.filter(b => b.catalogo === cat.tipo);
          const ativos = bannersDoTipo.filter(b => b.ativo).length;
          const aberto = secoesAbertas[cat.tipo];
          const capaAlterada = capaTemp[cat.tipo] !== capas[cat.tipo];

          return (
            <div key={cat.tipo} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Cabeçalho do acordeão */}
              <button
                onClick={() => toggleSecao(cat.tipo)}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition text-left"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.acento }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{cat.label}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cat.corBadge}`}>
                      {cat.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {bannersDoTipo.length} banner{bannersDoTipo.length !== 1 ? "s" : ""}
                    {bannersDoTipo.length > 0 && ` · ${ativos} ativo${ativos !== 1 ? "s" : ""}`}
                    {capas[cat.tipo] && " · capa definida"}
                  </p>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform shrink-0 ${aberto ? "rotate-180" : ""}`}
                />
              </button>

              {aberto && (
                <div className="border-t border-gray-100">
                  {/* Card de foto de capa */}
                  <div className="p-5 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                          <ImageIcon size={14} className="text-gray-500" />
                          Foto de Capa
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Aparece no card do catálogo em /revendedores
                        </p>
                      </div>
                      {capaAlterada && (
                        <button
                          onClick={() => salvarCapa(cat.tipo)}
                          disabled={salvandoCapa === cat.tipo}
                          className="flex items-center gap-1.5 bg-black text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-800 transition disabled:opacity-50"
                        >
                          {salvandoCapa === cat.tipo ? "Salvando..." : "Salvar capa"}
                        </button>
                      )}
                    </div>
                    <div className="w-52">
                      <ImageUpload
                        aspect="free"
                        value={capaTemp[cat.tipo] ?? ""}
                        onChange={v => setCapaTemp(c => ({ ...c, [cat.tipo]: v || null }))}
                      />
                    </div>
                  </div>

                  {/* Banners do catálogo */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-700">
                        Banners ({bannersDoTipo.length})
                      </span>
                      <Link
                        href={`/banners/novo?catalogo=${cat.tipo}`}
                        className="flex items-center gap-1.5 bg-black text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-800 transition"
                      >
                        <Plus size={13} />
                        Novo banner
                      </Link>
                    </div>

                    {bannersDoTipo.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
                        Nenhum banner cadastrado para este catálogo.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {bannersDoTipo.map(b => (
                          <div key={b.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="aspect-video bg-gray-100 overflow-hidden relative">
                              {b.imagemDesktop || b.imagemTablet || b.imagemMobile ? (
                                <img
                                  src={b.imagemDesktop ?? b.imagemTablet ?? b.imagemMobile ?? ""}
                                  alt={b.titulo ?? ""}
                                  className="w-full h-full object-cover"
                                />
                              ) : b.videoUrl ? (
                                <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                  <span className="text-white text-xs">Vídeo YouTube</span>
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-gray-300 text-xs">Sem imagem</span>
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                  {b.ativo ? "Ativo" : "Inativo"}
                                </span>
                                <span className="text-xs text-gray-400">Ordem: {b.ordem}</span>
                              </div>
                              {b.titulo && <p className="font-medium text-sm truncate">{b.titulo}</p>}
                              {b.subtitulo && <p className="text-xs text-gray-400 mt-0.5 truncate">{b.subtitulo}</p>}
                              <div className="mt-3">
                                <Link href={`/banners/${b.id}`} className="text-blue-600 hover:underline text-xs">
                                  Editar
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
