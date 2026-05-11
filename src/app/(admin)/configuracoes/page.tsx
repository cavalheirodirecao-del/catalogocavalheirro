"use client";

import { useEffect, useRef, useState } from "react";
import { formatarMoeda } from "@/lib/utils";
import { Megaphone, Webhook, FileText, ImageIcon, Upload } from "lucide-react";

export default function ConfiguracoesPage() {
  const [taxaExcursao, setTaxaExcursao] = useState("5.00");
  const [qtdAtacado, setQtdAtacado] = useState("15");
  const [qtdFabrica, setQtdFabrica] = useState("40");

  const [anuncioAtivo, setAnuncioAtivo] = useState(false);
  const [anuncioTexto, setAnuncioTexto] = useState("Frete grátis na primeira compra · Envio para todo o Brasil");

  const [webhookAtivo, setWebhookAtivo] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookToken, setWebhookToken] = useState("");

  const [googleFormUrl, setGoogleFormUrl] = useState("");

  const [fotoFabrica1, setFotoFabrica1] = useState("");
  const [fotoFabrica2, setFotoFabrica2] = useState("");
  const [fotoEquipe, setFotoEquipe] = useState("");
  const [fotoShowroom1, setFotoShowroom1] = useState("");
  const [fotoShowroom2, setFotoShowroom2] = useState("");
  const [uploadandoFoto, setUploadandoFoto] = useState<string | null>(null);

  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    fetch("/api/configuracoes")
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setTaxaExcursao(String(data.taxaExcursao));
          setQtdAtacado(String(data.qtdMinimaAtacado));
          setQtdFabrica(String(data.qtdMinimaFabrica));
          setAnuncioAtivo(data.anuncioBarAtivo ?? false);
          setAnuncioTexto(data.anuncioBarTexto ?? "Frete grátis na primeira compra · Envio para todo o Brasil");
          setWebhookAtivo(data.webhookAtivo ?? false);
          setWebhookUrl(data.webhookDataCrazyUrl ?? "");
          setWebhookToken(data.webhookDataCrazyToken ?? "");
          setGoogleFormUrl(data.googleFormUrl ?? "");
          setFotoFabrica1(data.fotoTrabalhoFabrica1 ?? "");
          setFotoFabrica2(data.fotoTrabalhoFabrica2 ?? "");
          setFotoEquipe(data.fotoTrabalhoEquipe ?? "");
          setFotoShowroom1(data.fotoTrabalhoShowroom1 ?? "");
          setFotoShowroom2(data.fotoTrabalhoShowroom2 ?? "");
        }
      });
  }, []);

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setMensagem("");

    await fetch("/api/configuracoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taxaExcursao: parseFloat(taxaExcursao),
        qtdMinimaAtacado: parseInt(qtdAtacado),
        qtdMinimaFabrica: parseInt(qtdFabrica),
        anuncioBarAtivo: anuncioAtivo,
        anuncioBarTexto: anuncioTexto,
        webhookAtivo,
        webhookDataCrazyUrl: webhookUrl || null,
        webhookDataCrazyToken: webhookToken || null,
        googleFormUrl: googleFormUrl || null,
        fotoTrabalhoFabrica1: fotoFabrica1 || null,
        fotoTrabalhoFabrica2: fotoFabrica2 || null,
        fotoTrabalhoEquipe: fotoEquipe || null,
        fotoTrabalhoShowroom1: fotoShowroom1 || null,
        fotoTrabalhoShowroom2: fotoShowroom2 || null,
      }),
    });

    setSalvando(false);
    setMensagem("Configurações salvas com sucesso!");
    setTimeout(() => setMensagem(""), 3000);
  }

  async function uploadFoto(file: File, setter: (url: string) => void, chave: string) {
    setUploadandoFoto(chave);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const json = await res.json();
    if (json.url) setter(json.url);
    setUploadandoFoto(null);
  }

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-gray-500 text-sm">Parâmetros gerais do sistema</p>
      </div>

      <form onSubmit={handleSalvar} className="max-w-lg space-y-6">

        {/* Frete por excursão */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold">Frete por Excursão</h2>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Taxa de excursão (R$)</label>
            <input type="number" step="0.01" min="0" value={taxaExcursao}
              onChange={(e) => setTaxaExcursao(e.target.value)} className={inputCls} />
            <p className="text-xs text-gray-400 mt-1">
              Valor atual: {formatarMoeda(parseFloat(taxaExcursao) || 0)}
            </p>
          </div>
        </div>

        {/* Quantidades mínimas */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold">Quantidade Mínima por Catálogo</h2>
          <p className="text-xs text-gray-400">Número mínimo de peças para finalizar um pedido</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Atacado (peças)</label>
              <input type="number" min="1" value={qtdAtacado}
                onChange={(e) => setQtdAtacado(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Fábrica (peças)</label>
              <input type="number" min="1" value={qtdFabrica}
                onChange={(e) => setQtdFabrica(e.target.value)} className={inputCls} />
            </div>
          </div>
        </div>

        {/* Barra de anúncio */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Megaphone size={16} className="text-gray-400" />
            <h2 className="font-semibold">Barra de Anúncio</h2>
          </div>
          <p className="text-xs text-gray-400">
            Aparece no topo do site público. Ideal para promoções e avisos rápidos.
          </p>

          {/* Toggle ativo */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Ativar barra</span>
            <button
              type="button"
              onClick={() => setAnuncioAtivo(v => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${anuncioAtivo ? "bg-black" : "bg-gray-200"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${anuncioAtivo ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Texto da barra</label>
            <input
              type="text"
              value={anuncioTexto}
              onChange={e => setAnuncioTexto(e.target.value)}
              placeholder="Ex: Frete grátis na primeira compra · Envio para todo o Brasil"
              className={inputCls}
            />
          </div>

          {/* Preview */}
          {anuncioAtivo && anuncioTexto && (
            <div className="rounded-lg overflow-hidden border border-gray-100">
              <p className="text-xs text-gray-400 px-3 py-1 bg-gray-50 border-b border-gray-100">Preview</p>
              <div className="bg-[#0A0A0A] py-2.5 px-4 text-center">
                <p className="text-xs tracking-widest text-white/70 uppercase">{anuncioTexto}</p>
              </div>
            </div>
          )}
        </div>

        {/* Webhook DataCrazy */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Webhook size={16} className="text-gray-400" />
            <h2 className="font-semibold">Webhook — DataCrazy CRM</h2>
          </div>
          <p className="text-xs text-gray-400">
            Envia dados de pedidos automaticamente para o CRM ao criar ou atualizar status.
          </p>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Ativar webhook</span>
            <button
              type="button"
              onClick={() => setWebhookAtivo(v => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${webhookAtivo ? "bg-black" : "bg-gray-200"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${webhookAtivo ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">URL do webhook</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={e => setWebhookUrl(e.target.value)}
              placeholder="https://app.datacrazy.com.br/webhook/..."
              className={inputCls}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Token de autenticação (opcional)</label>
            <input
              type="password"
              value={webhookToken}
              onChange={e => setWebhookToken(e.target.value)}
              placeholder="Bearer token ou API key"
              className={inputCls}
            />
          </div>
        </div>

        {/* Google Form — Trabalhe Conosco */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-gray-400" />
            <h2 className="font-semibold">Formulário — Trabalhe Conosco</h2>
          </div>
          <p className="text-xs text-gray-400">
            Cole aqui a URL do Google Forms para exibir na página "Trabalhe Conosco".
            Deixe em branco para exibir um placeholder com instruções.
          </p>
          <div>
            <label className="text-xs text-gray-500 block mb-1">URL do Google Forms</label>
            <input
              type="url"
              value={googleFormUrl}
              onChange={e => setGoogleFormUrl(e.target.value)}
              placeholder="https://docs.google.com/forms/d/e/.../viewform?embedded=true"
              className={inputCls}
            />
            <p className="text-xs text-gray-400 mt-1">
              Use o link de incorporação (Incorporar → copiar URL do iframe).
            </p>
          </div>
        </div>

        {/* Fotos — Trabalhe Conosco */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2">
            <ImageIcon size={16} className="text-gray-400" />
            <h2 className="font-semibold">Fotos — Trabalhe Conosco</h2>
          </div>
          <p className="text-xs text-gray-400">
            Imagens exibidas na seção "Nossa Fábrica" da página Trabalhe Conosco.
            Cole uma URL ou faça upload de um arquivo.
          </p>

          {[
            { label: "Fábrica — Foto 1", val: fotoFabrica1, set: setFotoFabrica1, chave: "f1" },
            { label: "Fábrica — Foto 2", val: fotoFabrica2, set: setFotoFabrica2, chave: "f2" },
            { label: "Nossa Equipe",     val: fotoEquipe,   set: setFotoEquipe,   chave: "eq" },
            { label: "Showroom — Foto 1",val: fotoShowroom1,set: setFotoShowroom1,chave: "s1" },
            { label: "Showroom — Foto 2",val: fotoShowroom2,set: setFotoShowroom2,chave: "s2" },
          ].map(({ label, val, set, chave }) => (
            <div key={chave} className="flex items-center gap-3 border border-gray-100 rounded-lg p-3">
              {/* Preview */}
              <div className="w-20 h-14 rounded-md overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                {val ? (
                  <img src={val} alt={label} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={16} className="text-gray-300" />
                  </div>
                )}
              </div>

              {/* Input URL + Upload */}
              <div className="flex-1 space-y-1.5">
                <p className="text-xs font-medium text-gray-600">{label}</p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={val}
                    onChange={e => set(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <label className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition whitespace-nowrap ${
                    uploadandoFoto === chave
                      ? "bg-gray-100 text-gray-400"
                      : "bg-gray-900 text-white hover:bg-gray-700"
                  }`}>
                    {uploadandoFoto === chave ? "..." : <><Upload size={11} /> Upload</>}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadandoFoto === chave}
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) uploadFoto(f, set, chave);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {mensagem && (
          <p className="text-green-600 text-sm font-medium">{mensagem}</p>
        )}

        <button
          type="submit"
          disabled={salvando}
          className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
        >
          {salvando ? "Salvando..." : "Salvar Configurações"}
        </button>
      </form>
    </div>
  );
}
