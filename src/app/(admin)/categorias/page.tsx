"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check, X, Power, ChevronRight, Camera, ImageIcon } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

interface SubGrupo {
  id: string;
  nome: string;
  ativo: boolean;
  _count?: { produtos: number };
}

interface Grupo {
  id: string;
  nome: string;
  ativo: boolean;
  imagemUrl?: string | null;
  bannerUrl?: string | null;
  _count: { produtos: number };
  subGrupos: SubGrupo[];
}

export default function CategoriasPage() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [grupoSelecionado, setGrupoSelecionado] = useState<Grupo | null>(null);

  // Estados de edição/criação
  const [novoGrupo, setNovoGrupo] = useState("");
  const [criandoGrupo, setCriandoGrupo] = useState(false);
  const [editandoGrupoId, setEditandoGrupoId] = useState<string | null>(null);
  const [editandoGrupoNome, setEditandoGrupoNome] = useState("");

  const [fotoGrupoId, setFotoGrupoId] = useState<string | null>(null);
  const [fotoGrupoUrl, setFotoGrupoUrl] = useState("");

  const [bannerGrupoId, setBannerGrupoId] = useState<string | null>(null);
  const [bannerGrupoUrl, setBannerGrupoUrl] = useState("");

  const [novoSubGrupo, setNovoSubGrupo] = useState("");
  const [criandoSubGrupo, setCriandoSubGrupo] = useState(false);
  const [editandoSubGrupoId, setEditandoSubGrupoId] = useState<string | null>(null);
  const [editandoSubGrupoNome, setEditandoSubGrupoNome] = useState("");

  const [erro, setErro] = useState("");

  async function carregar() {
    const data = await fetch("/api/grupos?admin=1").then(r => r.json());
    setGrupos(data);
    // Atualiza grupo selecionado se ainda existir
    if (grupoSelecionado) {
      const atualizado = data.find((g: Grupo) => g.id === grupoSelecionado.id);
      setGrupoSelecionado(atualizado ?? null);
    }
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  // — Grupos —

  async function criarGrupo() {
    if (!novoGrupo.trim()) return;
    setCriandoGrupo(true);
    setErro("");
    const res = await fetch("/api/grupos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: novoGrupo }),
    });
    if (!res.ok) {
      const d = await res.json();
      setErro(d.erro ?? "Erro ao criar categoria.");
    } else {
      setNovoGrupo("");
      await carregar();
    }
    setCriandoGrupo(false);
  }

  async function salvarEdicaoGrupo(id: string) {
    if (!editandoGrupoNome.trim()) return;
    await fetch(`/api/grupos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: editandoGrupoNome }),
    });
    setEditandoGrupoId(null);
    await carregar();
  }

  async function toggleGrupo(id: string, ativo: boolean) {
    await fetch(`/api/grupos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !ativo }),
    });
    await carregar();
  }

  async function excluirGrupo(id: string, nome: string) {
    if (!confirm(`Excluir a categoria "${nome}"?`)) return;
    setErro("");
    const res = await fetch(`/api/grupos/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      setErro(d.erro ?? "Erro ao excluir.");
    } else {
      if (grupoSelecionado?.id === id) setGrupoSelecionado(null);
      await carregar();
    }
  }

  async function salvarFotoGrupo(id: string) {
    await fetch(`/api/grupos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imagemUrl: fotoGrupoUrl || null }),
    });
    setFotoGrupoId(null);
    setFotoGrupoUrl("");
    await carregar();
  }

  async function salvarBannerGrupo(id: string) {
    await fetch(`/api/grupos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bannerUrl: bannerGrupoUrl || null }),
    });
    setBannerGrupoId(null);
    setBannerGrupoUrl("");
    await carregar();
  }

  // — SubGrupos —

  async function criarSubGrupo() {
    if (!novoSubGrupo.trim() || !grupoSelecionado) return;
    setCriandoSubGrupo(true);
    setErro("");
    const res = await fetch(`/api/grupos/${grupoSelecionado.id}/subgrupos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: novoSubGrupo }),
    });
    if (!res.ok) {
      const d = await res.json();
      setErro(d.erro ?? "Erro ao criar subcategoria.");
    } else {
      setNovoSubGrupo("");
      await carregar();
    }
    setCriandoSubGrupo(false);
  }

  async function salvarEdicaoSubGrupo(id: string) {
    if (!editandoSubGrupoNome.trim()) return;
    await fetch(`/api/subgrupos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: editandoSubGrupoNome }),
    });
    setEditandoSubGrupoId(null);
    await carregar();
  }

  async function toggleSubGrupo(id: string, ativo: boolean) {
    await fetch(`/api/subgrupos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !ativo }),
    });
    await carregar();
  }

  async function excluirSubGrupo(id: string, nome: string) {
    if (!confirm(`Excluir a subcategoria "${nome}"?`)) return;
    setErro("");
    const res = await fetch(`/api/subgrupos/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      setErro(d.erro ?? "Erro ao excluir.");
    } else {
      await carregar();
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <p className="text-gray-500 text-sm mt-1">Gerencie grupos e subcategorias de produtos</p>
      </div>

      {erro && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center justify-between">
          {erro}
          <button onClick={() => setErro("")}><X size={14} /></button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        {/* Coluna — Categorias (Grupos) */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Categorias</h2>
              <p className="text-xs text-gray-400 mt-0.5">{grupos.length} categorias</p>
            </div>
          </div>

          {/* Criar nova categoria */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex gap-2">
              <input
                type="text"
                value={novoGrupo}
                onChange={e => setNovoGrupo(e.target.value)}
                onKeyDown={e => e.key === "Enter" && criarGrupo()}
                placeholder="Nova categoria..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              />
              <button
                onClick={criarGrupo}
                disabled={criandoGrupo || !novoGrupo.trim()}
                className="flex items-center gap-1 bg-black text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-800 transition disabled:opacity-40"
              >
                <Plus size={14} />
                Criar
              </button>
            </div>
          </div>

          {/* Lista de grupos */}
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
            </div>
          ) : grupos.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">Nenhuma categoria cadastrada.</div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {grupos.map(g => (
                <li
                  key={g.id}
                  onClick={() => { if (editandoGrupoId !== g.id && fotoGrupoId !== g.id && bannerGrupoId !== g.id) setGrupoSelecionado(g); }}
                  className={`flex flex-col cursor-pointer transition ${
                    grupoSelecionado?.id === g.id ? "bg-gray-50" : "hover:bg-gray-50"
                  } ${!g.ativo ? "opacity-50" : ""}`}
                >
                  {/* Linha principal */}
                  <div className="px-4 py-3 flex items-center gap-3">
                    {editandoGrupoId === g.id ? (
                      <div className="flex flex-1 items-center gap-2" onClick={e => e.stopPropagation()}>
                        <input
                          autoFocus
                          type="text"
                          value={editandoGrupoNome}
                          onChange={e => setEditandoGrupoNome(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") salvarEdicaoGrupo(g.id);
                            if (e.key === "Escape") setEditandoGrupoId(null);
                          }}
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                        />
                        <button onClick={() => salvarEdicaoGrupo(g.id)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <Check size={14} />
                        </button>
                        <button onClick={() => setEditandoGrupoId(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        {g.imagemUrl && (
                          <img src={g.imagemUrl} alt={g.nome} className="w-8 h-8 rounded object-cover shrink-0 border border-gray-100" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{g.nome}</p>
                          <p className="text-xs text-gray-400">
                            {g._count.produtos} produto{g._count.produtos !== 1 ? "s" : ""}
                            {" · "}
                            {g.subGrupos.length} subcategoria{g.subGrupos.length !== 1 ? "s" : ""}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setFotoGrupoId(fotoGrupoId === g.id ? null : g.id);
                              setFotoGrupoUrl(g.imagemUrl ?? "");
                              setBannerGrupoId(null);
                            }}
                            title="Foto da categoria (PDF)"
                            className={`p-1.5 rounded hover:bg-gray-100 transition ${fotoGrupoId === g.id ? "text-gray-700 bg-gray-100" : "text-gray-400 hover:text-gray-700"}`}
                          >
                            <Camera size={13} />
                          </button>
                          <button
                            onClick={() => {
                              setBannerGrupoId(bannerGrupoId === g.id ? null : g.id);
                              setBannerGrupoUrl(g.bannerUrl ?? "");
                              setFotoGrupoId(null);
                            }}
                            title="Banner do catálogo"
                            className={`p-1.5 rounded hover:bg-gray-100 transition ${bannerGrupoId === g.id ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:text-gray-700"}`}
                          >
                            <ImageIcon size={13} />
                          </button>
                          <button
                            onClick={() => toggleGrupo(g.id, g.ativo)}
                            title={g.ativo ? "Desativar" : "Ativar"}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
                          >
                            <Power size={13} />
                          </button>
                          <button
                            onClick={() => { setEditandoGrupoId(g.id); setEditandoGrupoNome(g.nome); }}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={() => excluirGrupo(g.id, g.nome)}
                            className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {grupoSelecionado?.id === g.id && (
                          <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
                        )}
                      </>
                    )}
                  </div>

                  {/* Painel inline de foto */}
                  {fotoGrupoId === g.id && (
                    <div
                      className="px-4 pb-4 border-t border-gray-100 bg-gray-50"
                      onClick={e => e.stopPropagation()}
                    >
                      <p className="text-xs font-medium text-gray-600 mt-3 mb-2">Foto da categoria (usada no PDF)</p>
                      <div className="flex items-end gap-3">
                        <div className="w-44">
                          <ImageUpload
                            aspect="free"
                            value={fotoGrupoUrl}
                            onChange={v => setFotoGrupoUrl(v)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => salvarFotoGrupo(g.id)}
                            className="flex items-center gap-1 bg-black text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-800 transition"
                          >
                            <Check size={12} />
                            Salvar
                          </button>
                          <button
                            onClick={() => { setFotoGrupoId(null); setFotoGrupoUrl(""); }}
                            className="px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-200 transition"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Painel inline de banner do catálogo */}
                  {bannerGrupoId === g.id && (
                    <div
                      className="px-4 pb-4 border-t border-blue-100 bg-blue-50/50"
                      onClick={e => e.stopPropagation()}
                    >
                      <p className="text-xs font-medium text-blue-700 mt-3 mb-1">Banner do catálogo</p>
                      <p className="text-xs text-blue-500 mb-2">Exibido quando o cliente filtra por esta categoria. Use imagem larga (ex: 1200×300 px).</p>
                      <div className="flex items-end gap-3">
                        <div className="flex-1 max-w-xs">
                          <ImageUpload
                            aspect="free"
                            value={bannerGrupoUrl}
                            onChange={v => setBannerGrupoUrl(v)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => salvarBannerGrupo(g.id)}
                            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition"
                          >
                            <Check size={12} />
                            Salvar
                          </button>
                          <button
                            onClick={() => { setBannerGrupoId(null); setBannerGrupoUrl(""); }}
                            className="px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-200 transition"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Coluna — Subcategorias */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">
              {grupoSelecionado ? `Subcategorias — ${grupoSelecionado.nome}` : "Subcategorias"}
            </h2>
            {grupoSelecionado ? (
              <p className="text-xs text-gray-400 mt-0.5">{grupoSelecionado.subGrupos.length} subcategorias</p>
            ) : (
              <p className="text-xs text-gray-400 mt-0.5">Selecione uma categoria para ver as subcategorias</p>
            )}
          </div>

          {grupoSelecionado ? (
            <>
              {/* Criar nova subcategoria */}
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={novoSubGrupo}
                    onChange={e => setNovoSubGrupo(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && criarSubGrupo()}
                    placeholder="Nova subcategoria..."
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                  <button
                    onClick={criarSubGrupo}
                    disabled={criandoSubGrupo || !novoSubGrupo.trim()}
                    className="flex items-center gap-1 bg-black text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-800 transition disabled:opacity-40"
                  >
                    <Plus size={14} />
                    Criar
                  </button>
                </div>
              </div>

              {/* Lista de subgrupos */}
              {grupoSelecionado.subGrupos.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  Nenhuma subcategoria cadastrada para esta categoria.
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {grupoSelecionado.subGrupos.map(s => (
                    <li
                      key={s.id}
                      className={`px-4 py-3 flex items-center gap-3 ${!s.ativo ? "opacity-50" : ""}`}
                    >
                      {editandoSubGrupoId === s.id ? (
                        <div className="flex flex-1 items-center gap-2">
                          <input
                            autoFocus
                            type="text"
                            value={editandoSubGrupoNome}
                            onChange={e => setEditandoSubGrupoNome(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === "Enter") salvarEdicaoSubGrupo(s.id);
                              if (e.key === "Escape") setEditandoSubGrupoId(null);
                            }}
                            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                          />
                          <button onClick={() => salvarEdicaoSubGrupo(s.id)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                            <Check size={14} />
                          </button>
                          <button onClick={() => setEditandoSubGrupoId(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 truncate">{s.nome}</p>
                            {!s.ativo && <span className="text-xs text-gray-400">Inativo</span>}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => toggleSubGrupo(s.id, s.ativo)}
                              title={s.ativo ? "Desativar" : "Ativar"}
                              className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
                            >
                              <Power size={13} />
                            </button>
                            <button
                              onClick={() => { setEditandoSubGrupoId(s.id); setEditandoSubGrupoNome(s.nome); }}
                              className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => excluirSubGrupo(s.id, s.nome)}
                              className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-300">
              <ChevronRight size={40} />
              <p className="text-sm mt-2">Selecione uma categoria à esquerda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
