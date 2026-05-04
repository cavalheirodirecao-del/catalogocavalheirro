"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { formatarMoeda, gerarLinkWhatsApp } from "@/lib/utils";
import { ItemCarrinho } from "@/components/catalogo/CartProvider";
import { TipoCatalogo } from "@prisma/client";

interface Loja { id: string; nome: string; cidade: string; endereco?: string | null; }
interface Vendedor { id: string; slug: string; telefone: string | null; usuario: { nome: string }; }
interface ConfigGeral { taxaExcursao: number; qtdMinimaAtacado: number; qtdMinimaFabrica: number; }

const STORAGE_KEY = "cavalheiro_cart";
const CIDADES_EXCURSAO = ["Caruaru", "Toritama", "Santa Cruz do Capibaribe"];

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400">Carregando...</p></div>}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const catalogoParam = (searchParams.get("catalogo") ?? "VAREJO") as TipoCatalogo;
  const vendedorParam = searchParams.get("vendedor");

  const [itens, setItens] = useState<ItemCarrinho[]>([]);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [configGeral, setConfigGeral] = useState<ConfigGeral>({ taxaExcursao: 5, qtdMinimaAtacado: 15, qtdMinimaFabrica: 40 });

  // Dados cliente
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");

  // Pagamento
  const [formaPagamento, setFormaPagamento] = useState<"VISTA" | "PRAZO">("VISTA");

  // Envio
  const [tipoEnvio, setTipoEnvio] = useState<"RETIRADA_LOJA" | "CORREIOS" | "EXCURSAO">("RETIRADA_LOJA");

  // Retirada na loja
  const [lojaId, setLojaId] = useState("");

  // Correios
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidadeCorreios, setCidadeCorreios] = useState("");
  const [complemento, setComplemento] = useState("");
  const [referencia, setReferencia] = useState("");

  // Frete Melhor Envio
  interface OpcaoFrete { id: string; nome: string; empresa: string; preco: number; prazoMin: number; }
  const [opcoesFrete, setOpcoesFrete] = useState<OpcaoFrete[]>([]);
  const [calculandoFrete, setCalculandoFrete] = useState(false);
  const [freteErro, setFreteErro] = useState("");
  const [opcaoFreteSelecionada, setOpcaoFreteSelecionada] = useState<OpcaoFrete | null>(null);

  // Excursão
  const [excCidadeOrigem, setExcCidadeOrigem] = useState("");
  const [excNome, setExcNome] = useState("");
  const [excTelefone, setExcTelefone] = useState("");
  const [excLocal, setExcLocal] = useState("");
  const [excCidadeEntrega, setExcCidadeEntrega] = useState("");

  // Cupom
  const [cupom, setCupom] = useState("");
  const [cupomAplicado, setCupomAplicado] = useState<{ tipo: string; valor: number | null; codigo: string } | null>(null);
  const [cupomErro, setCupomErro] = useState("");

  // Primeira compra
  const [primeiraCompra, setPrimeiraCompra] = useState(false);

  // Rastreamento de afiliado via cookie _ref
  const [refCookie, setRefCookie] = useState<string | null>(null);

  // Outros
  const [vendedorId, setVendedorId] = useState(vendedorParam ?? "");
  const [obs, setObs] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [pedidoCriado, setPedidoCriado] = useState<{ numero: number; whatsappUrl: string } | null>(null);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY);
      if (salvo) setItens(JSON.parse(salvo).itens ?? []);
    } catch {}

    // Pré-preenche dados do cadastro (RegistroWall)
    try {
      const leadDados = localStorage.getItem("lead_dados");
      if (leadDados) {
        const { nome: n, telefone: t } = JSON.parse(leadDados);
        if (n) setNome(n);
        if (t) setTelefone(t);
      }
    } catch {}

    // Lê cookie _ref para atribuição de afiliado (last-touch)
    try {
      const match = document.cookie.match(/(?:^|;\s*)_ref=([^;]+)/);
      if (match && !vendedorParam) setRefCookie(decodeURIComponent(match[1]));
    } catch {}

    fetch("/api/checkout-dados").then(r => r.json()).then(data => {
      setLojas(data.lojas ?? []);
      setVendedores(data.vendedores ?? []);
      setConfigGeral(data.configGeral ?? { taxaExcursao: 5, qtdMinimaAtacado: 15, qtdMinimaFabrica: 40 });
    });
  }, []);

  // Calcula frete via Melhor Envio quando CEP atinge 8 dígitos
  useEffect(() => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8 || tipoEnvio !== "CORREIOS" || primeiraCompra) return;
    setOpcoesFrete([]);
    setOpcaoFreteSelecionada(null);
    setFreteErro("");
    setCalculandoFrete(true);

    const itensPayload = itens.map(i => ({
      quantidade: i.quantidade,
      pesoGramas: 300, // padrão — atualizar quando produtos tiverem peso
      alturaCm: 5,
      larguraCm: 20,
      comprimentoCm: 25,
      precoUnitario: i.precoUnitario,
    }));

    fetch("/api/frete/calcular", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cepDestino: cepLimpo, itens: itensPayload }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.erro) { setFreteErro(data.erro); }
        else { setOpcoesFrete(data); }
      })
      .catch(() => setFreteErro("Erro ao calcular frete."))
      .finally(() => setCalculandoFrete(false));
  }, [cep, tipoEnvio, primeiraCompra]);

  // Verifica primeira compra quando telefone tem 10+ dígitos
  useEffect(() => {
    const normalizado = telefone.replace(/\D/g, "");
    if (normalizado.length < 10) { setPrimeiraCompra(false); return; }
    fetch(`/api/checkout-dados?telefone=${encodeURIComponent(normalizado)}`)
      .then(r => r.json())
      .then(data => setPrimeiraCompra(data.primeiraCompra ?? false))
      .catch(() => {});
  }, [telefone]);

  // ── Cálculo de preços ──────────────────────────────────
  const precoItem = (item: ItemCarrinho) =>
    formaPagamento === "PRAZO" && item.precoPrazo ? item.precoPrazo : item.precoUnitario;

  const subtotal = itens.reduce((acc, i) => acc + precoItem(i) * i.quantidade, 0);

  const valorFrete = (() => {
    if (tipoEnvio === "EXCURSAO" && cupomAplicado?.tipo !== "FRETE_GRATIS") return configGeral.taxaExcursao;
    if (tipoEnvio === "CORREIOS" && !primeiraCompra && opcaoFreteSelecionada) return opcaoFreteSelecionada.preco;
    return 0;
  })();

  let desconto = 0;
  if (cupomAplicado) {
    if (cupomAplicado.tipo === "PERCENTUAL" && cupomAplicado.valor)
      desconto = (subtotal * cupomAplicado.valor) / 100;
    else if (cupomAplicado.tipo === "VALOR_FIXO" && cupomAplicado.valor)
      desconto = cupomAplicado.valor;
  }

  const total = Math.max(0, subtotal + valorFrete - desconto);

  async function aplicarCupom() {
    setCupomErro("");
    if (!cupom.trim()) return;
    const res = await fetch(`/api/cupons/validar?codigo=${cupom.trim()}&total=${subtotal}`);
    const data = await res.json();
    if (data.erro) { setCupomErro(data.erro); setCupomAplicado(null); }
    else setCupomAplicado({ tipo: data.tipo, valor: data.valor, codigo: data.codigo });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);

    const vendedorSelecionado = vendedores.find(v => v.id === vendedorId || v.slug === vendedorParam);

    // Monta dados de excursão
    const excursaoTexto = tipoEnvio === "EXCURSAO"
      ? JSON.stringify({ cidadeOrigem: excCidadeOrigem, nome: excNome, telefone: excTelefone, local: excLocal, cidadeEntrega: excCidadeEntrega })
      : null;

    // Monta endereço Correios
    const enderecoEntrega = tipoEnvio === "CORREIOS"
      ? JSON.stringify({
          cep, rua, numero, bairro, cidade: cidadeCorreios, complemento, referencia,
          servicoFrete: opcaoFreteSelecionada ? `${opcaoFreteSelecionada.nome} (${opcaoFreteSelecionada.empresa})` : null,
          freteGratis: primeiraCompra,
        })
      : null;

    const body = {
      catalogo: catalogoParam,
      vendedorId: vendedorSelecionado?.id ?? null,
      nomeCliente: nome,
      telefoneCliente: telefone,
      tipoEnvio,
      lojaRetiradaId: tipoEnvio === "RETIRADA_LOJA" ? lojaId : null,
      excursaoTexto,
      enderecoEntrega,
      valorFrete,
      formaPagamento,
      cupomCodigo: cupomAplicado?.codigo ?? null,
      desconto,
      total,
      obs,
      refSlug: vendedorParam ?? refCookie ?? null,
      itens: itens.map(i => ({
        varianteId: i.varianteId,
        quantidade: i.quantidade,
        precoUnitario: precoItem(i),
        subtotal: precoItem(i) * i.quantidade,
      })),
    };

    const res = await fetch("/api/pedidos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();

    if (data.numero) {
      const loja = lojas.find(l => l.id === lojaId);
      const excursaoLabel = excNome ? `${excNome} - ${excCidadeOrigem}` : undefined;
      const whatsappUrl = vendedorSelecionado?.telefone
        ? gerarLinkWhatsApp(vendedorSelecionado.telefone, {
            numero: data.numero, nomeCliente: nome,
            itens: itens.map(i => ({ nome: i.produtoNome, cor: i.corNome, tamanho: i.tamanho, quantidade: i.quantidade })),
            total, tipoEnvio, excursaoNome: excursaoLabel, lojaNome: loja?.nome, formaPagamento, catalogo: catalogoParam,
          })
        : null;

      localStorage.removeItem(STORAGE_KEY);
      setPedidoCriado({ numero: data.numero, whatsappUrl: whatsappUrl ?? "" });
    }
    setEnviando(false);
  }

  if (pedidoCriado) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-sm w-full text-center space-y-4">
          <div className="text-5xl">🎉</div>
          <h1 className="text-xl font-bold">Pedido #{pedidoCriado.numero} recebido!</h1>
          <p className="text-gray-500 text-sm">Agora envie seu pedido para o vendedor pelo WhatsApp.</p>
          {pedidoCriado.whatsappUrl && (
            <a href={pedidoCriado.whatsappUrl} target="_blank" rel="noopener noreferrer"
              className="block w-full bg-green-500 text-white rounded-xl py-3 font-semibold text-sm hover:bg-green-600 transition">
              📱 Enviar pelo WhatsApp
            </a>
          )}
          <button onClick={() => router.back()} className="block w-full text-gray-500 text-sm hover:underline">
            Voltar ao catálogo
          </button>
        </div>
      </div>
    );
  }

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black";
  const labelCls = "text-xs text-gray-500 block mb-1";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-black text-white px-4 py-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-lg font-bold">Finalizar Pedido</h1>
          <p className="text-xs text-white/50">
            {catalogoParam === "ATACADO" ? "Atacado" : catalogoParam === "FABRICA" ? "Fábrica" : "Varejo"}
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* ── Itens ─────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h2 className="font-semibold mb-3">Itens do Pedido</h2>
          {itens.length === 0 && <p className="text-gray-400 text-sm">Carrinho vazio.</p>}
          {itens.map((item) => (
            <div key={item.varianteId} className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
              {item.imagemUrl && (
                <img src={item.imagemUrl} alt={item.produtoNome} className="w-14 h-14 object-cover rounded-lg bg-gray-100 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">{item.produtoNome}</p>
                <p className="text-xs text-gray-400">{item.tamanho} · {item.corNome} · {item.quantidade}x</p>
              </div>
              <p className="text-sm font-bold shrink-0">{formatarMoeda(precoItem(item) * item.quantidade)}</p>
            </div>
          ))}
        </div>

        {/* ── Forma de Pagamento ────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-3">
          <h2 className="font-semibold">Forma de Pagamento</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { valor: "VISTA", label: "PIX / Depósito", sub: "preço à vista" },
              { valor: "PRAZO", label: "Cartão / Boleto", sub: "preço a prazo" },
            ].map((op) => (
              <button key={op.valor} type="button" onClick={() => setFormaPagamento(op.valor as any)}
                className={`rounded-xl border p-3 text-left transition ${formaPagamento === op.valor ? "border-black bg-black text-white" : "border-gray-200 hover:border-gray-400"}`}>
                <p className="font-medium text-sm">{op.label}</p>
                <p className={`text-xs ${formaPagamento === op.valor ? "text-white/70" : "text-gray-400"}`}>{op.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Dados do cliente ──────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-3">
          <h2 className="font-semibold">Seus Dados</h2>
          <div>
            <label className={labelCls}>Nome completo *</label>
            <input required value={nome} onChange={e => setNome(e.target.value)} className={inputCls} placeholder="João Silva" />
          </div>
          <div>
            <label className={labelCls}>WhatsApp *</label>
            <input required value={telefone} onChange={e => setTelefone(e.target.value)} className={inputCls} placeholder="(81) 99999-9999" />
          </div>
        </div>

        {/* ── Vendedor ──────────────────────────────── */}
        {vendedorParam ? (
          (() => {
            const v = vendedores.find(v => v.slug === vendedorParam);
            return v ? (
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">Vendedor</p>
                  <p className="font-semibold text-sm">{v.usuario.nome}</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Vinculado</span>
              </div>
            ) : null;
          })()
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-3">
            <h2 className="font-semibold">Vendedor</h2>
            <select required value={vendedorId} onChange={e => setVendedorId(e.target.value)} className={inputCls}>
              <option value="">Escolha o vendedor...</option>
              {vendedores.map(v => <option key={v.id} value={v.id}>{v.usuario.nome}</option>)}
            </select>
          </div>
        )}

        {/* ── Forma de Envio ────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-3">
          <h2 className="font-semibold">Forma de Envio</h2>
          <div className="space-y-2">
            {/* Retirada na Loja */}
            <div className={`rounded-xl border transition ${tipoEnvio === "RETIRADA_LOJA" ? "border-black" : "border-gray-200"}`}>
              <button type="button" onClick={() => setTipoEnvio("RETIRADA_LOJA")}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition ${tipoEnvio === "RETIRADA_LOJA" ? "bg-black text-white" : "hover:bg-gray-50"}`}>
                <span className="text-sm font-medium">Retirar na Loja</span>
                <span className={`text-xs ${tipoEnvio === "RETIRADA_LOJA" ? "text-white/70" : "text-gray-400"}`}>Grátis</span>
              </button>
              {tipoEnvio === "RETIRADA_LOJA" && (
                <div className="px-3 pb-3 pt-1 space-y-1">
                  <label className="text-xs text-gray-500 block mb-1">Em qual loja vai retirar? *</label>
                  <select required value={lojaId} onChange={e => setLojaId(e.target.value)} className={inputCls}>
                    <option value="">Selecione a loja...</option>
                    {lojas.map(l => (
                      <option key={l.id} value={l.id}>{l.nome} — {l.cidade}</option>
                    ))}
                  </select>
                  {lojaId && (() => {
                    const loja = lojas.find(l => l.id === lojaId);
                    return loja?.endereco ? (
                      <p className="text-xs text-gray-400 mt-1">📍 {loja.endereco}</p>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            <button type="button" onClick={() => setTipoEnvio("CORREIOS")}
              className={`w-full flex items-center justify-between rounded-xl border p-3 transition ${tipoEnvio === "CORREIOS" ? "border-black bg-black text-white" : "border-gray-200 hover:border-gray-400"}`}>
              <span className="text-sm font-medium">Correios</span>
              <span className={`text-xs font-medium ${tipoEnvio === "CORREIOS" ? "text-white/70" : primeiraCompra ? "text-green-600" : "text-gray-400"}`}>
                {primeiraCompra ? "Grátis (1ª compra)" : "Frete a calcular"}
              </span>
            </button>
            <button type="button" onClick={() => setTipoEnvio("EXCURSAO")}
              className={`w-full flex items-center justify-between rounded-xl border p-3 transition ${tipoEnvio === "EXCURSAO" ? "border-black bg-black text-white" : "border-gray-200 hover:border-gray-400"}`}>
              <span className="text-sm font-medium">Excursão</span>
              <span className={`text-xs ${tipoEnvio === "EXCURSAO" ? "text-white/70" : "text-gray-400"}`}>{`Taxa R$ ${configGeral.taxaExcursao}`}</span>
            </button>
          </div>

          {/* Correios */}
          {tipoEnvio === "CORREIOS" && (
            <div className="space-y-3 pt-1">
              {primeiraCompra ? (
                <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2 font-medium">
                  Primeira compra — frete grátis!
                </p>
              ) : (
                <div>
                  {calculandoFrete && (
                    <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 flex items-center gap-2">
                      <span className="inline-block w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                      Calculando frete...
                    </p>
                  )}
                  {freteErro && (
                    <p className="text-xs text-yellow-700 bg-yellow-50 rounded-lg px-3 py-2">{freteErro}</p>
                  )}
                  {opcoesFrete.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs text-gray-500 font-medium">Selecione uma opção de frete:</p>
                      {opcoesFrete.map(op => (
                        <button key={op.id} type="button" onClick={() => setOpcaoFreteSelecionada(op)}
                          className={`w-full flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition ${opcaoFreteSelecionada?.id === op.id ? "border-black bg-black text-white" : "border-gray-200 hover:border-gray-400"}`}>
                          <div className="text-left">
                            <p className="font-medium">{op.nome}</p>
                            <p className={`text-xs ${opcaoFreteSelecionada?.id === op.id ? "text-white/60" : "text-gray-400"}`}>
                              {op.empresa} · {op.prazoMin} {op.prazoMin === 1 ? "dia útil" : "dias úteis"}
                            </p>
                          </div>
                          <span className="font-bold shrink-0 ml-3">{formatarMoeda(op.preco)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {opcoesFrete.length === 0 && !calculandoFrete && !freteErro && (
                    <p className="text-xs text-yellow-700 bg-yellow-50 rounded-lg px-3 py-2">
                      Preencha o CEP para calcular o frete automaticamente.
                    </p>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>CEP *</label>
                  <input required value={cep} onChange={e => setCep(e.target.value)} className={inputCls} placeholder="00000-000" />
                </div>
                <div>
                  <label className={labelCls}>Número *</label>
                  <input required value={numero} onChange={e => setNumero(e.target.value)} className={inputCls} placeholder="123" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Rua / Logradouro *</label>
                <input required value={rua} onChange={e => setRua(e.target.value)} className={inputCls} placeholder="Rua das Flores" />
              </div>
              <div>
                <label className={labelCls}>Bairro *</label>
                <input required value={bairro} onChange={e => setBairro(e.target.value)} className={inputCls} placeholder="Centro" />
              </div>
              <div>
                <label className={labelCls}>Cidade *</label>
                <input required value={cidadeCorreios} onChange={e => setCidadeCorreios(e.target.value)} className={inputCls} placeholder="Recife" />
              </div>
              <div>
                <label className={labelCls}>Complemento</label>
                <input value={complemento} onChange={e => setComplemento(e.target.value)} className={inputCls} placeholder="Apto 101, Bloco B..." />
              </div>
              <div>
                <label className={labelCls}>Ponto de referência</label>
                <input value={referencia} onChange={e => setReferencia(e.target.value)} className={inputCls} placeholder="Próximo ao mercado X" />
              </div>
            </div>
          )}

          {/* Excursão */}
          {tipoEnvio === "EXCURSAO" && (
            <div className="space-y-3 pt-1">
              <p className="text-xs text-gray-500">Preencha os dados da excursão que vai retirar seu pedido.</p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                <p className="text-xs text-amber-700 leading-relaxed">
                  <strong>Atenção:</strong> A taxa de R$ {configGeral.taxaExcursao} cobrada aqui é apenas uma taxa simbólica de embalagem e logística interna. O frete da excursão (cobrado pelo organizador) é pago separadamente, direto ao responsável pela excursão.
                </p>
              </div>
              <div>
                <label className={labelCls}>Cidade de origem da excursão *</label>
                <select required value={excCidadeOrigem} onChange={e => setExcCidadeOrigem(e.target.value)} className={inputCls}>
                  <option value="">Selecione...</option>
                  {CIDADES_EXCURSAO.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="Outra">Outra cidade</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Nome da excursão *</label>
                <input required value={excNome} onChange={e => setExcNome(e.target.value)} className={inputCls} placeholder="Ex: Excursão do João" />
              </div>
              <div>
                <label className={labelCls}>Telefone da excursão *</label>
                <input required value={excTelefone} onChange={e => setExcTelefone(e.target.value)} className={inputCls} placeholder="(81) 99999-9999" />
              </div>
              <div>
                <label className={labelCls}>Local onde a excursão fica (setor/vaga) *</label>
                <input required value={excLocal} onChange={e => setExcLocal(e.target.value)} className={inputCls} placeholder="Ex: Setor Amarelo Vaga 15" />
              </div>
              <div>
                <label className={labelCls}>Cidade de entrega *</label>
                <input required value={excCidadeEntrega} onChange={e => setExcCidadeEntrega(e.target.value)} className={inputCls} placeholder="Ex: Recife" />
              </div>
            </div>
          )}
        </div>

        {/* ── Cupom ─────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-3">
          <h2 className="font-semibold">Cupom de Desconto</h2>
          <div className="flex gap-2">
            <input value={cupom} onChange={e => setCupom(e.target.value.toUpperCase())} placeholder="Código do cupom"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
            <button type="button" onClick={aplicarCupom} className="bg-black text-white rounded-lg px-4 text-sm hover:bg-gray-800 transition">
              Aplicar
            </button>
          </div>
          {cupomErro && <p className="text-red-500 text-xs">{cupomErro}</p>}
          {cupomAplicado && <p className="text-green-600 text-xs">✓ Cupom <strong>{cupomAplicado.codigo}</strong> aplicado!</p>}
        </div>

        {/* ── Observação ────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <label className={labelCls}>Observação (opcional)</label>
          <textarea value={obs} onChange={e => setObs(e.target.value)} rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
            placeholder="Alguma observação sobre o pedido..." />
        </div>

        {/* ── Resumo financeiro ─────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal ({formaPagamento === "VISTA" ? "à vista" : "a prazo"})</span>
            <span>{formatarMoeda(subtotal)}</span>
          </div>
          {tipoEnvio === "CORREIOS" && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Frete</span>
              {primeiraCompra
                ? <span className="text-green-600 text-xs font-medium">Grátis (1ª compra)</span>
                : opcaoFreteSelecionada
                  ? <span className="font-medium">{formatarMoeda(opcaoFreteSelecionada.preco)}</span>
                  : <span className="text-yellow-600 text-xs font-medium">A calcular</span>
              }
            </div>
          )}
          {valorFrete > 0 && tipoEnvio === "EXCURSAO" && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Taxa excursão</span>
              <span>{formatarMoeda(valorFrete)}</span>
            </div>
          )}
          {desconto > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Desconto</span>
              <span>- {formatarMoeda(desconto)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t border-gray-100 pt-2 mt-2">
            <span>Total</span>
            <span>{formatarMoeda(total)}</span>
          </div>
          {formaPagamento === "PRAZO" && itens.some(i => i.precoPrazo && i.precoPrazo !== i.precoUnitario) && (
            <p className="text-xs text-gray-400 text-right">Preço a prazo aplicado</p>
          )}
        </div>

        <button type="submit" disabled={enviando || itens.length === 0}
          className="w-full bg-black text-white rounded-xl py-4 font-bold text-base hover:bg-gray-800 transition disabled:opacity-40">
          {enviando ? "Processando..." : "Confirmar Pedido"}
        </button>
      </form>
    </div>
  );
}
