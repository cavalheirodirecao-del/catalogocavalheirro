"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Trash2, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

interface Variante {
  id: string;
  sku: string | null;
  produto: { codigo: string; nome: string };
  cor: { nome: string };
  gradeItem: { valor: string };
}

interface LinhaMovimentacao {
  varianteId: string;
  descricao: string;
  quantidade: number;
}

export default function NovaMovimentacaoPage() {
  const router = useRouter();
  const [tipo, setTipo] = useState<"ENTRADA" | "SAIDA">("ENTRADA");

  // Campos de entrada
  const [fornecedor, setFornecedor] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [dataDocumento, setDataDocumento] = useState(new Date().toISOString().split("T")[0]);
  const [obs, setObs] = useState("");

  // Seletor de produtos
  const [busca, setBusca] = useState("");
  const [variantes, setVariantes] = useState<Variante[]>([]);
  const [resultados, setResultados] = useState<Variante[]>([]);
  const [buscando, setBuscando] = useState(false);
  const buscaRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Linhas da movimentação
  const [linhas, setLinhas] = useState<LinhaMovimentacao[]>([]);

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  // Carrega variantes
  useEffect(() => {
    fetch("/api/produtos")
      .then(r => r.json())
      .then(produtos => {
        const vars: Variante[] = [];
        for (const p of produtos) {
          for (const cor of p.cores) {
            for (const v of cor.variantes) {
              vars.push({
                id: v.id,
                sku: v.sku,
                produto: { codigo: p.codigo, nome: p.nome },
                cor: { nome: cor.nome },
                gradeItem: v.gradeItem,
              });
            }
          }
        }
        setVariantes(vars);
      });
  }, []);

  // Busca com debounce
  useEffect(() => {
    if (buscaRef.current) clearTimeout(buscaRef.current);
    if (!busca.trim()) { setResultados([]); return; }
    setBuscando(true);
    buscaRef.current = setTimeout(() => {
      const t = busca.toLowerCase();
      setResultados(
        variantes.filter(v =>
          v.produto.nome.toLowerCase().includes(t) ||
          v.produto.codigo.toLowerCase().includes(t) ||
          v.cor.nome.toLowerCase().includes(t) ||
          (v.sku ?? "").toLowerCase().includes(t)
        ).slice(0, 10)
      );
      setBuscando(false);
    }, 200);
  }, [busca, variantes]);

  function adicionarLinha(v: Variante) {
    const jaExiste = linhas.find(l => l.varianteId === v.id);
    if (jaExiste) return;
    setLinhas(prev => [...prev, {
      varianteId: v.id,
      descricao: `${v.produto.codigo} — ${v.produto.nome} · ${v.cor.nome} · ${v.gradeItem.valor}`,
      quantidade: 1,
    }]);
    setBusca("");
    setResultados([]);
  }

  function removerLinha(idx: number) {
    setLinhas(prev => prev.filter((_, i) => i !== idx));
  }

  function atualizarQtd(idx: number, qtd: number) {
    setLinhas(prev => prev.map((l, i) => i === idx ? { ...l, quantidade: Math.max(1, qtd) } : l));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (linhas.length === 0) { setErro("Adicione pelo menos um item."); return; }
    setErro("");
    setSalvando(true);

    try {
      const promises = linhas.map(l =>
        fetch("/api/estoque", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            varianteId: l.varianteId,
            tipo,
            quantidade: l.quantidade,
            obs: obs || null,
            fornecedor: tipo === "ENTRADA" ? (fornecedor || null) : null,
            numeroDocumento: numeroDocumento || null,
            dataDocumento: dataDocumento || null,
          }),
        })
      );
      await Promise.all(promises);
      router.push("/estoque/movimentacoes");
    } catch {
      setErro("Erro ao registrar movimentação. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nova Movimentação</h1>
        <p className="text-gray-500 text-sm">Registre entrada ou saída de estoque em lote</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Tipo */}
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setTipo("ENTRADA")}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${tipo === "ENTRADA" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
            <ArrowUpCircle size={28} className={tipo === "ENTRADA" ? "text-green-600" : "text-gray-300"} />
            <span className={`font-semibold text-sm ${tipo === "ENTRADA" ? "text-green-700" : "text-gray-400"}`}>Entrada</span>
            <span className="text-xs text-gray-400">Recebimento de mercadoria</span>
          </button>
          <button type="button" onClick={() => setTipo("SAIDA")}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${tipo === "SAIDA" ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}>
            <ArrowDownCircle size={28} className={tipo === "SAIDA" ? "text-red-500" : "text-gray-300"} />
            <span className={`font-semibold text-sm ${tipo === "SAIDA" ? "text-red-600" : "text-gray-400"}`}>Saída</span>
            <span className="text-xs text-gray-400">Devolução, troca, descarte</span>
          </button>
        </div>

        {/* Dados do documento */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-sm text-gray-700">Dados do Documento</h2>

          {tipo === "ENTRADA" && (
            <div>
              <label className="text-xs text-gray-500 block mb-1">Fornecedor</label>
              <input type="text" value={fornecedor} onChange={e => setFornecedor(e.target.value)}
                placeholder="Nome do fornecedor" className={inputCls} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Nº Documento (NF, romaneio…)</label>
              <input type="text" value={numeroDocumento} onChange={e => setNumeroDocumento(e.target.value)}
                placeholder="Ex: NF-001234" className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Data do documento</label>
              <input type="date" value={dataDocumento} onChange={e => setDataDocumento(e.target.value)}
                className={inputCls} />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Observação</label>
            <input type="text" value={obs} onChange={e => setObs(e.target.value)}
              placeholder={tipo === "SAIDA" ? "Ex: Devolução por defeito, troca de coleção…" : "Ex: Compra regular, reposição…"}
              className={inputCls} />
          </div>
        </div>

        {/* Seletor de produtos */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-sm text-gray-700">Itens da Movimentação</h2>

          {/* Busca */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
              placeholder="Buscar por referência, nome ou cor…"
              className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            {resultados.length > 0 && (
              <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden max-h-52 overflow-y-auto">
                {resultados.map(v => (
                  <button key={v.id} type="button" onClick={() => adicionarLinha(v)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-left">
                    <Plus size={14} className="text-gray-300 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{v.produto.nome}</p>
                      <p className="text-xs text-gray-400">{v.produto.codigo} · {v.cor.nome} · {v.gradeItem.valor}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Linhas */}
          {linhas.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Nenhum item adicionado. Use a busca acima.</p>
          ) : (
            <div className="space-y-2">
              {linhas.map((l, idx) => (
                <div key={l.varianteId} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2.5">
                  <p className="flex-1 text-sm text-gray-700 min-w-0 truncate">{l.descricao}</p>
                  <input type="number" min="1" value={l.quantidade}
                    onChange={e => atualizarQtd(idx, Number(e.target.value))}
                    className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-black shrink-0" />
                  <button type="button" onClick={() => removerLinha(idx)}
                    className="text-gray-300 hover:text-red-400 transition shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <p className="text-xs text-gray-400 text-right">{linhas.length} item{linhas.length !== 1 ? "s" : ""}</p>
            </div>
          )}
        </div>

        {erro && <p className="text-red-500 text-sm">{erro}</p>}

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()}
            className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm hover:bg-gray-50 transition">
            Cancelar
          </button>
          <button type="submit" disabled={salvando || linhas.length === 0}
            className={`flex-1 text-white rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-50 ${tipo === "ENTRADA" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>
            {salvando ? "Registrando…" : `Registrar ${tipo === "ENTRADA" ? "Entrada" : "Saída"}`}
          </button>
        </div>

      </form>
    </div>
  );
}
