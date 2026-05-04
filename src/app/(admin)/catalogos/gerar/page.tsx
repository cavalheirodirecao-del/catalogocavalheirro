"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileDown, Loader2, Image as ImageIcon, LayoutGrid, Columns } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import type { TabelaPreco, LayoutPDF } from "@/components/pdf/types";

interface SubGrupo {
  id: string;
  nome: string;
}

interface Grupo {
  id: string;
  nome: string;
  subGrupos: SubGrupo[];
}

const TABELAS: { value: TabelaPreco; label: string; descricao: string }[] = [
  { value: "VAREJO", label: "Varejo", descricao: "Preços B2C ao consumidor final" },
  { value: "ATACADO", label: "Atacado", descricao: "Preços B2B por quantidade" },
  { value: "FABRICA", label: "Fábrica", descricao: "Preços direto da produção" },
  { value: "SEM_PRECO", label: "Sem preço", descricao: "Apenas fotos e referências" },
];

const LAYOUTS: { value: LayoutPDF; label: string; descricao: string; icone: React.ReactNode }[] = [
  {
    value: "UMA_FOTO",
    label: "Uma foto grande",
    descricao: "6 produtos por página — foto + bolinhas de cor e tamanhos disponíveis",
    icone: (
      <svg viewBox="0 0 80 100" className="w-full h-full" fill="none">
        <rect x="4" y="4" width="34" height="44" rx="2" fill="#E5E7EB" />
        <rect x="4" y="52" width="34" height="6" rx="1" fill="#9CA3AF" />
        <rect x="4" y="61" width="20" height="4" rx="1" fill="#D1D5DB" />
        <rect x="42" y="4" width="34" height="44" rx="2" fill="#E5E7EB" />
        <rect x="42" y="52" width="34" height="6" rx="1" fill="#9CA3AF" />
        <rect x="42" y="61" width="20" height="4" rx="1" fill="#D1D5DB" />
        <rect x="4" y="72" width="34" height="44" rx="2" fill="#E5E7EB" />
        <rect x="42" y="72" width="34" height="44" rx="2" fill="#E5E7EB" />
      </svg>
    ),
  },
  {
    value: "TRES_FOTOS",
    label: "Três fotos",
    descricao: "2 produtos por página — 1 foto grande + 2 menores com preço",
    icone: (
      <svg viewBox="0 0 80 100" className="w-full h-full" fill="none">
        <rect x="4" y="4" width="46" height="56" rx="2" fill="#E5E7EB" />
        <rect x="54" y="4" width="22" height="27" rx="2" fill="#D1D5DB" />
        <rect x="54" y="33" width="22" height="27" rx="2" fill="#D1D5DB" />
        <rect x="4" y="64" width="72" height="6" rx="1" fill="#9CA3AF" />
        <rect x="4" y="73" width="40" height="4" rx="1" fill="#D1D5DB" />
        <rect x="4" y="80" width="28" height="10" rx="1" fill="#111827" />
      </svg>
    ),
  },
];

export default function GerarCatalogoPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoId, setGrupoId] = useState("");
  const [subGrupoId, setSubGrupoId] = useState("");
  const [capaUrl, setCapaUrl] = useState("");
  const [tabelaPreco, setTabelaPreco] = useState<TabelaPreco>("ATACADO");
  const [layout, setLayout] = useState<LayoutPDF>("UMA_FOTO");
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const router = useRouter();

  const grupoSelecionado = grupos.find(g => g.id === grupoId);
  const subGrupos = grupoSelecionado?.subGrupos ?? [];

  useEffect(() => {
    fetch("/api/grupos")
      .then(r => r.json())
      .then(setGrupos);
  }, []);

  async function handleGerar() {
    setGerando(true);
    setErro(null);
    try {
      const res = await fetch("/api/catalogo/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grupoId: grupoId || undefined,
          subGrupoId: subGrupoId || undefined,
          capaUrl: capaUrl || undefined,
          tabelaPreco,
          layout,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.erro ?? "Falha ao criar o catálogo.");
      }

      // Redireciona para o histórico — geração acontece lá em segundo plano
      router.push("/catalogos/historico");
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : "Erro desconhecido.");
      setGerando(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Gerar Catálogo PDF</h1>
        <p className="text-gray-500 text-sm mt-1">
          Filtre os produtos, escolha a capa e a tabela de preços.
        </p>
      </div>

      <div className="space-y-6">
        {/* Filtro por grupo/subgrupo */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-4">Produtos</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
              <select
                value={grupoId}
                onChange={e => { setGrupoId(e.target.value); setSubGrupoId(""); }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Todos os grupos</option>
                {grupos.map(g => (
                  <option key={g.id} value={g.id}>{g.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subgrupo</label>
              <select
                value={subGrupoId}
                onChange={e => setSubGrupoId(e.target.value)}
                disabled={subGrupos.length === 0}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-40"
              >
                <option value="">Todos os subgrupos</option>
                {subGrupos.map(s => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Capa */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-4">
            <span className="flex items-center gap-2"><ImageIcon size={14} /> Capa do catálogo</span>
          </h2>
          <ImageUpload
            value={capaUrl}
            onChange={setCapaUrl}
            label="Imagem da capa (A4 portrait recomendado)"
            aspect="free"
          />
          {!capaUrl && (
            <p className="text-xs text-gray-400 mt-2">
              Se não informada, será gerada uma capa padrão com o nome da marca.
            </p>
          )}
        </section>

        {/* Tabela de preço */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-4">Tabela de preços</h2>
          <div className="grid grid-cols-2 gap-3">
            {TABELAS.map(t => (
              <button
                key={t.value}
                onClick={() => setTabelaPreco(t.value)}
                className={`text-left p-3 rounded-lg border-2 transition ${
                  tabelaPreco === t.value
                    ? "border-black bg-gray-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="font-semibold text-sm">{t.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.descricao}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Layout */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-4">
            <span className="flex items-center gap-2"><LayoutGrid size={14} /> Layout das páginas</span>
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {LAYOUTS.map(l => (
              <button
                key={l.value}
                onClick={() => setLayout(l.value)}
                className={`text-left rounded-xl border-2 overflow-hidden transition ${
                  layout === l.value
                    ? "border-black"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="aspect-[4/5] bg-gray-50 p-4">
                  {l.icone}
                </div>
                <div className="p-3 border-t border-gray-100">
                  <p className="font-semibold text-sm">{l.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{l.descricao}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Erro */}
        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            {erro}
          </div>
        )}

        {/* Botão gerar */}
        <button
          onClick={handleGerar}
          disabled={gerando}
          className="w-full flex items-center justify-center gap-2 bg-black text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {gerando ? (
            <><Loader2 size={16} className="animate-spin" /> Criando catálogo…</>
          ) : (
            <><FileDown size={16} /> Gerar catálogo</>
          )}
        </button>
      </div>
    </div>
  );
}
