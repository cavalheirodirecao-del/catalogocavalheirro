"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bold, Italic, Underline, List, ListOrdered,
  Link as LinkIcon, Image as ImageIcon, Heading2, Heading3,
  Quote, Eye, EyeOff, Star, Loader2, Save,
  ChevronLeft, Settings2, X, Upload,
} from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

interface PostEditorProps {
  post?: {
    id: string;
    titulo: string;
    slug: string;
    resumo: string | null;
    conteudo: string;
    imagemCapa: string | null;
    autor: string | null;
    publicado: boolean;
    destaque: boolean;
    palavrasChave: string | null;
  };
}

function gerarSlug(titulo: string) {
  return titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const TAMANHOS_IMG = [
  { label: "Pequena",  val: "30%" },
  { label: "Média",    val: "50%" },
  { label: "Grande",   val: "75%" },
  { label: "Original", val: "100%" },
] as const;

const CORES_TEXTO = [
  { label: "Padrão",   val: "#111827", classe: "bg-gray-900 border-2 border-gray-300" },
  { label: "Branco",   val: "#FFFFFF", classe: "bg-white border border-gray-300" },
  { label: "Cinza",    val: "#9CA3AF", classe: "bg-gray-400" },
  { label: "Dourado",  val: "#B8954A", classe: "bg-[#B8954A]" },
  { label: "Vermelho", val: "#EF4444", classe: "bg-red-500" },
  { label: "Verde",    val: "#22C55E", classe: "bg-green-500" },
  { label: "Azul",     val: "#3B82F6", classe: "bg-blue-500" },
  { label: "Laranja",  val: "#F97316", classe: "bg-orange-500" },
] as const;

export default function PostEditor({ post }: PostEditorProps) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [titulo, setTitulo] = useState(post?.titulo ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugManual, setSlugManual] = useState(!!post?.slug);
  const [resumo, setResumo] = useState(post?.resumo ?? "");
  const [imagemCapa, setImagemCapa] = useState(post?.imagemCapa ?? "");
  const [autor, setAutor] = useState(post?.autor ?? "Equipe Cavalheiro");
  const [publicado, setPublicado] = useState(post?.publicado ?? false);
  const [destaque, setDestaque] = useState(post?.destaque ?? false);
  const [palavrasChave, setPalavrasChave] = useState(post?.palavrasChave ?? "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sidebarAberta, setSidebarAberta] = useState(true);

  // Imagem selecionada no editor para redimensionar
  const [imgSelecionada, setImgSelecionada] = useState<HTMLImageElement | null>(null);
  const [imgPos, setImgPos] = useState<{ top: number; left: number } | null>(null);

  // Paleta de cores de texto
  const [paletaCor, setPaletaCor] = useState(false);
  const paletaRef = useRef<HTMLDivElement>(null);

  // Fecha paleta ao clicar fora
  useEffect(() => {
    function fechar(e: MouseEvent) {
      if (paletaRef.current && !paletaRef.current.contains(e.target as Node)) {
        setPaletaCor(false);
      }
    }
    if (paletaCor) document.addEventListener("mousedown", fechar);
    return () => document.removeEventListener("mousedown", fechar);
  }, [paletaCor]);

  // Upload de imagem no corpo do post
  const [uploadandoImg, setUploadandoImg] = useState(false);

  useEffect(() => {
    if (editorRef.current && post?.conteudo) {
      editorRef.current.innerHTML = post.conteudo;
    }
  }, []);

  // Fecha toolbar de imagem ao fazer scroll
  useEffect(() => {
    function fecharToolbar() {
      if (imgSelecionada) {
        imgSelecionada.style.removeProperty("outline");
        imgSelecionada.style.removeProperty("outline-offset");
        setImgSelecionada(null);
        setImgPos(null);
      }
    }
    window.addEventListener("scroll", fecharToolbar, true);
    return () => window.removeEventListener("scroll", fecharToolbar, true);
  }, [imgSelecionada]);

  function handleTituloChange(v: string) {
    setTitulo(v);
    if (!slugManual) setSlug(gerarSlug(v));
  }

  const exec = useCallback((cmd: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
  }, []);

  function inserirLink() {
    const url = prompt("URL do link:");
    if (url) exec("createLink", url);
  }

  function inserirImagemUrl() {
    const url = prompt("URL da imagem:");
    if (url) exec("insertImage", url);
  }

  async function uploadImagemCorpo(file: File) {
    setUploadandoImg(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) exec("insertImage", data.url);
    } catch {}
    setUploadandoImg(false);
  }

  // Clique em imagem dentro do editor → mostra toolbar de redimensionar
  function handleEditorClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    if (target.tagName === "IMG") {
      const img = target as HTMLImageElement;
      // Remove destaque anterior
      imgSelecionada?.style.removeProperty("outline");
      imgSelecionada?.style.removeProperty("outline-offset");
      // Destaca a imagem clicada
      img.style.outline = "2px solid #3B82F6";
      img.style.outlineOffset = "2px";
      const rect = img.getBoundingClientRect();
      setImgSelecionada(img);
      setImgPos({ top: rect.bottom + 8, left: rect.left });
    } else {
      imgSelecionada?.style.removeProperty("outline");
      imgSelecionada?.style.removeProperty("outline-offset");
      setImgSelecionada(null);
      setImgPos(null);
    }
  }

  function atualizarPosToolbar() {
    requestAnimationFrame(() => {
      if (!imgSelecionada) return;
      const rect = imgSelecionada.getBoundingClientRect();
      setImgPos({ top: rect.bottom + 8, left: rect.left });
    });
  }

  function definirLargura(largura: string) {
    if (!imgSelecionada) return;
    imgSelecionada.style.width = largura;
    imgSelecionada.style.height = "auto";
    imgSelecionada.style.display = "block";
    atualizarPosToolbar();
  }

  function definirLayout(tipo: "bloco" | "esquerda" | "direita") {
    if (!imgSelecionada) return;
    const img = imgSelecionada;
    // Limpa layout anterior
    img.style.removeProperty("float");
    img.style.removeProperty("margin-left");
    img.style.removeProperty("margin-right");
    img.style.removeProperty("margin-bottom");
    img.style.display = "block";

    if (tipo === "esquerda") {
      img.style.float = "left";
      img.style.width = img.style.width || "48%";
      img.style.marginRight = "12px";
      img.style.marginBottom = "8px";
    } else if (tipo === "direita") {
      img.style.float = "right";
      img.style.width = img.style.width || "48%";
      img.style.marginLeft = "12px";
      img.style.marginBottom = "8px";
    }
    atualizarPosToolbar();
  }

  function inserirClearfix() {
    editorRef.current?.focus();
    document.execCommand(
      "insertHTML",
      false,
      '<div style="clear:both;margin:0"></div><p><br></p>'
    );
  }

  function inserirGaleria2Colunas() {
    editorRef.current?.focus();
    document.execCommand(
      "insertHTML",
      false,
      '<div style="display:flex;gap:10px;margin:16px 0;align-items:flex-start">' +
        '<div style="flex:1;min-width:0"><p style="color:#9ca3af;font-size:12px;text-align:center;border:2px dashed #e5e7eb;padding:20px;border-radius:8px;margin:0">Clique aqui e insira a imagem da esquerda</p></div>' +
        '<div style="flex:1;min-width:0"><p style="color:#9ca3af;font-size:12px;text-align:center;border:2px dashed #e5e7eb;padding:20px;border-radius:8px;margin:0">Clique aqui e insira a imagem da direita</p></div>' +
      '</div><p><br></p>'
    );
  }

  function inserirGaleria3Colunas() {
    editorRef.current?.focus();
    document.execCommand(
      "insertHTML",
      false,
      '<div style="display:flex;gap:8px;margin:16px 0;align-items:flex-start">' +
        '<div style="flex:1;min-width:0"><p style="color:#9ca3af;font-size:12px;text-align:center;border:2px dashed #e5e7eb;padding:16px;border-radius:8px;margin:0">Imagem 1</p></div>' +
        '<div style="flex:1;min-width:0"><p style="color:#9ca3af;font-size:12px;text-align:center;border:2px dashed #e5e7eb;padding:16px;border-radius:8px;margin:0">Imagem 2</p></div>' +
        '<div style="flex:1;min-width:0"><p style="color:#9ca3af;font-size:12px;text-align:center;border:2px dashed #e5e7eb;padding:16px;border-radius:8px;margin:0">Imagem 3</p></div>' +
      '</div><p><br></p>'
    );
  }

  // Paste: se for imagem direta (print, cópia de arquivo), faz upload
  async function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const items = Array.from(e.clipboardData.items);
    const imagemItem = items.find(i => i.type.startsWith("image/"));
    if (imagemItem) {
      e.preventDefault();
      const file = imagemItem.getAsFile();
      if (!file) return;
      await uploadImagemCorpo(file);
    }
    // Paste de texto/HTML: comportamento padrão do browser
  }

  async function salvar(publicarAgora?: boolean) {
    if (!titulo || !editorRef.current) return;
    const conteudo = editorRef.current.innerHTML;
    if (!conteudo || conteudo === "<br>") {
      setErro("O conteúdo está vazio.");
      return;
    }

    setSalvando(true);
    setErro("");

    const body = {
      titulo,
      slug,
      resumo: resumo || null,
      conteudo,
      imagemCapa: imagemCapa || null,
      autor,
      publicado: publicarAgora !== undefined ? publicarAgora : publicado,
      destaque,
      palavrasChave: palavrasChave || null,
    };

    const url = post ? `/api/blog/${post.id}` : "/api/blog";
    const method = post ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErro(data.error ?? "Erro ao salvar.");
      setSalvando(false);
      return;
    }

    router.push("/posts");
    router.refresh();
  }

  const btnTool =
    "p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors flex items-center justify-center";

  return (
    <>
      {/* Toolbar flutuante da imagem — tamanho + layout */}
      {imgSelecionada && imgPos && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-xl p-3 space-y-2.5"
          style={{ top: imgPos.top, left: Math.min(imgPos.left, window.innerWidth - 320) }}
          onMouseDown={e => e.preventDefault()}
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Imagem selecionada</span>
            <button
              onClick={() => {
                imgSelecionada.style.removeProperty("outline");
                imgSelecionada.style.removeProperty("outline-offset");
                setImgSelecionada(null);
                setImgPos(null);
              }}
              className="p-0.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded"
            >
              <X size={12} />
            </button>
          </div>

          {/* Tamanho */}
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Tamanho</p>
            <div className="flex flex-wrap gap-1">
              {TAMANHOS_IMG.map(({ label, val }) => {
                const atual = imgSelecionada?.style.width === val;
                return (
                  <button
                    key={val}
                    onClick={() => definirLargura(val)}
                    className={`text-xs px-2.5 py-1 rounded-lg transition-colors font-medium ${
                      atual ? "bg-blue-500 text-white" : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {label}
                    <span className="ml-1 text-[9px] opacity-60">{val}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Layout / Posição */}
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Posição no texto</p>
            <div className="flex gap-1">
              {[
                { tipo: "bloco" as const,    label: "⬛ Bloco",           desc: "Linha inteira" },
                { tipo: "esquerda" as const, label: "↩ Col. esq.",        desc: "Texto à direita" },
                { tipo: "direita" as const,  label: "↪ Col. dir.",        desc: "Texto à esquerda" },
              ].map(({ tipo, label, desc }) => {
                const floatAtual = imgSelecionada?.style.float || "none";
                const ativo =
                  (tipo === "bloco" && floatAtual === "none") ||
                  (tipo === "esquerda" && floatAtual === "left") ||
                  (tipo === "direita" && floatAtual === "right");
                return (
                  <button
                    key={tipo}
                    onClick={() => definirLayout(tipo)}
                    title={desc}
                    className={`text-xs px-2.5 py-1 rounded-lg transition-colors font-medium ${
                      ativo ? "bg-indigo-500 text-white" : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {(imgSelecionada?.style.float === "left" || imgSelecionada?.style.float === "right") && (
              <p className="text-[10px] text-gray-400 mt-1.5">
                Dica: clique em <strong>Fim de colunas</strong> na barra para encerrar o layout lado a lado.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ minHeight: "calc(100vh - 48px)" }}>
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-gray-200 bg-white flex-shrink-0 z-10 sticky top-0">
          <Link
            href="/posts"
            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft size={20} />
          </Link>

          <span className="text-sm font-medium text-gray-700 flex-1">
            {post ? "Editar post" : "Novo post"}
          </span>

          {erro && (
            <span className="text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded">
              {erro}
            </span>
          )}

          <button
            onClick={() => salvar(false)}
            disabled={salvando}
            className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {salvando ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Salvar rascunho
          </button>

          <button
            onClick={() => salvar(true)}
            disabled={salvando}
            className="flex items-center gap-1.5 text-sm bg-gray-900 text-white px-3 py-1.5 rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {salvando ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />}
            {publicado ? "Salvar" : "Publicar"}
          </button>

          <button
            onClick={() => setSidebarAberta(!sidebarAberta)}
            className={`p-1.5 rounded transition-colors ${sidebarAberta ? "bg-gray-100 text-gray-900" : "hover:bg-gray-100 text-gray-500 hover:text-gray-900"}`}
            title="Configurações do post"
          >
            <Settings2 size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {/* Editor principal */}
          <div className="flex-1 flex flex-col">
            {/* Título */}
            <div className="px-10 pt-10 pb-0">
              <input
                type="text"
                value={titulo}
                onChange={(e) => handleTituloChange(e.target.value)}
                placeholder="Título"
                className="w-full text-4xl font-light text-gray-900 placeholder:text-gray-300 border-none outline-none bg-transparent"
              />
              <div className="mt-3 h-px bg-gray-100" />
            </div>

            {/* Toolbar */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-1.5 flex flex-wrap items-center gap-0.5 z-10">
              <button onClick={() => exec("bold")} className={btnTool} title="Negrito"><Bold size={15} /></button>
              <button onClick={() => exec("italic")} className={btnTool} title="Itálico"><Italic size={15} /></button>
              <button onClick={() => exec("underline")} className={btnTool} title="Sublinhado"><Underline size={15} /></button>
              <div className="w-px h-4 bg-gray-200 mx-1" />
              <button onClick={() => exec("formatBlock", "h2")} className={btnTool} title="Título H2"><Heading2 size={15} /></button>
              <button onClick={() => exec("formatBlock", "h3")} className={btnTool} title="Título H3"><Heading3 size={15} /></button>
              <button onClick={() => exec("formatBlock", "blockquote")} className={btnTool} title="Citação"><Quote size={15} /></button>
              <div className="w-px h-4 bg-gray-200 mx-1" />
              <button onClick={() => exec("insertUnorderedList")} className={btnTool} title="Lista"><List size={15} /></button>
              <button onClick={() => exec("insertOrderedList")} className={btnTool} title="Lista numerada"><ListOrdered size={15} /></button>
              <div className="w-px h-4 bg-gray-200 mx-1" />
              {/* Cor do texto */}
              <div className="relative" ref={paletaRef}>
                <button
                  onClick={() => setPaletaCor(p => !p)}
                  className={`${btnTool} flex-col gap-0`}
                  title="Cor do texto"
                >
                  <span className="text-xs font-bold leading-none">A</span>
                  <span className="w-3 h-0.5 rounded-full bg-gray-600 mt-0.5" />
                </button>
                {paletaCor && (
                  <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-gray-200 rounded-lg shadow-xl p-2 flex flex-col gap-1 min-w-[120px]">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider px-1 mb-0.5">Cor do texto</p>
                    <div className="flex flex-wrap gap-1.5">
                      {CORES_TEXTO.map(({ label, val, classe }) => (
                        <button
                          key={val}
                          title={label}
                          onMouseDown={e => {
                            e.preventDefault();
                            exec("foreColor", val);
                            setPaletaCor(false);
                          }}
                          className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${classe}`}
                        />
                      ))}
                    </div>
                    <button
                      onMouseDown={e => {
                        e.preventDefault();
                        exec("removeFormat");
                        setPaletaCor(false);
                      }}
                      className="mt-1 text-[10px] text-gray-500 hover:text-gray-900 text-left px-1 py-0.5 hover:bg-gray-100 rounded transition-colors"
                    >
                      ↺ Remover cor
                    </button>
                  </div>
                )}
              </div>
              <div className="w-px h-4 bg-gray-200 mx-1" />
              <button onClick={inserirLink} className={btnTool} title="Inserir link"><LinkIcon size={15} /></button>
              <button onClick={inserirImagemUrl} className={btnTool} title="Inserir imagem por URL"><ImageIcon size={15} /></button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadandoImg}
                className={`${btnTool} relative`}
                title="Enviar imagem do computador"
              >
                {uploadandoImg
                  ? <Loader2 size={15} className="animate-spin text-blue-500" />
                  : <Upload size={15} />
                }
              </button>
              <div className="w-px h-4 bg-gray-200 mx-1" />
              {/* Layout de imagens em colunas */}
              <button
                onClick={inserirGaleria2Colunas}
                className={btnTool}
                title="Inserir galeria de 2 colunas lado a lado"
              >
                <span className="text-[11px] font-bold leading-none tracking-tight">⬜⬜</span>
              </button>
              <button
                onClick={inserirGaleria3Colunas}
                className={btnTool}
                title="Inserir galeria de 3 colunas"
              >
                <span className="text-[11px] font-bold leading-none tracking-tight">⬜⬜⬜</span>
              </button>
              <button
                onClick={inserirClearfix}
                className={`${btnTool} text-[10px] font-medium text-gray-500`}
                title="Encerrar colunas (volta para layout normal)"
              >
                ↓fim
              </button>
            </div>

            {/* Input oculto para upload de imagem no corpo */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) uploadImagemCorpo(file);
                e.target.value = "";
              }}
            />

            {/* Dica de clique em imagem */}
            {uploadandoImg && (
              <div className="mx-10 mt-3 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded px-3 py-2 flex items-center gap-2">
                <Loader2 size={12} className="animate-spin" />
                Enviando imagem...
              </div>
            )}

            {/* Área de conteúdo */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              data-placeholder="Comece a escrever... Cole imagens diretamente ou use o botão de upload."
              onClick={handleEditorClick}
              onPaste={handlePaste}
              className="flex-1 px-10 py-6 text-[17px] leading-8 text-gray-800 outline-none min-h-[500px]
                [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:text-gray-900
                [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-gray-900
                [&_p]:mb-4
                [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-500 [&_blockquote]:my-4
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
                [&_li]:mb-1
                [&_a]:text-blue-600 [&_a]:underline
                [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-4 [&_img]:cursor-pointer
                empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 empty:before:pointer-events-none"
            />

            {/* Legenda de ajuda */}
            <p className="px-10 pb-4 text-xs text-gray-300">
              Clique em uma imagem no texto para redimensioná-la
            </p>
          </div>

          {/* Sidebar */}
          {sidebarAberta && (
            <div className="w-72 border-l border-gray-200 flex-shrink-0 overflow-y-auto bg-gray-50" style={{ maxHeight: "calc(100vh - 48px)", position: "sticky", top: 0 }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
                <span className="text-sm font-semibold text-gray-700">Configurações</span>
                <button
                  onClick={() => setSidebarAberta(false)}
                  className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="divide-y divide-gray-200">
                {/* Status */}
                <div className="px-4 py-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</p>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="flex items-center gap-2 text-sm text-gray-700">
                      {publicado
                        ? <Eye size={14} className="text-green-600" />
                        : <EyeOff size={14} className="text-gray-400" />}
                      {publicado ? "Publicado" : "Rascunho"}
                    </span>
                    <div
                      onClick={() => setPublicado(!publicado)}
                      className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${publicado ? "bg-green-500" : "bg-gray-300"}`}
                    >
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${publicado ? "translate-x-4" : "translate-x-0"}`} />
                    </div>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="flex items-center gap-2 text-sm text-gray-700">
                      <Star size={14} className={destaque ? "text-yellow-500 fill-yellow-400" : "text-gray-400"} />
                      Destaque
                    </span>
                    <div
                      onClick={() => setDestaque(!destaque)}
                      className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${destaque ? "bg-yellow-400" : "bg-gray-300"}`}
                    >
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${destaque ? "translate-x-4" : "translate-x-0"}`} />
                    </div>
                  </label>
                </div>

                {/* Slug */}
                <div className="px-4 py-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">URL do post</p>
                  <div className="text-xs text-gray-400 mb-1">/blog/</div>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => { setSlugManual(true); setSlug(e.target.value); }}
                    placeholder="meu-artigo"
                    className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                </div>

                {/* Resumo */}
                <div className="px-4 py-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Resumo</p>
                  <textarea
                    value={resumo}
                    onChange={(e) => setResumo(e.target.value)}
                    rows={3}
                    maxLength={300}
                    placeholder="Breve resumo (aparece no Google)"
                    className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm text-gray-800 bg-white resize-none focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                  <p className="text-xs text-gray-400 text-right">{resumo.length}/300</p>
                </div>

                {/* Imagem de capa — upload do computador */}
                <div className="px-4 py-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Imagem de capa</p>
                  <ImageUpload
                    value={imagemCapa}
                    onChange={setImagemCapa}
                    aspect="free"
                  />
                </div>

                {/* Autor */}
                <div className="px-4 py-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Autor</p>
                  <input
                    type="text"
                    value={autor}
                    onChange={(e) => setAutor(e.target.value)}
                    className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                </div>

                {/* Palavras-chave */}
                <div className="px-4 py-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Palavras-chave (SEO)</p>
                  <p className="text-xs text-gray-400">Separadas por vírgula</p>
                  <textarea
                    value={palavrasChave}
                    onChange={(e) => setPalavrasChave(e.target.value)}
                    rows={3}
                    placeholder="jeans, moda masculina, ..."
                    className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-sm text-gray-800 bg-white resize-none focus:outline-none focus:ring-1 focus:ring-gray-400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
