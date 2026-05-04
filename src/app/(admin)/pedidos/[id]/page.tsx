"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Printer, Truck, X, ExternalLink } from "lucide-react";

const STATUS_OPTIONS = ["PENDENTE", "CONFIRMADO", "SEPARANDO", "ENVIADO", "CONCLUIDO", "CANCELADO"];
const STATUS_COLORS: Record<string, string> = {
  PENDENTE: "bg-yellow-100 text-yellow-700",
  CONFIRMADO: "bg-blue-100 text-blue-700",
  SEPARANDO: "bg-purple-100 text-purple-700",
  ENVIADO: "bg-indigo-100 text-indigo-700",
  CONCLUIDO: "bg-green-100 text-green-700",
  CANCELADO: "bg-red-100 text-red-600",
};

function formatMoeda(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function parseJsonSafe(str: string | null): Record<string, string> | null {
  if (!str) return null;
  try { return JSON.parse(str); } catch { return null; }
}

export default function DetalhePedidoPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pedido, setPedido] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [obs, setObs] = useState("");

  // Vínculo de excursão
  const [excursoes, setExcursoes] = useState<{ id: string; nome: string }[]>([]);
  const [excursaoSelecionada, setExcursaoSelecionada] = useState<string>("");
  const [vinculando, setVinculando] = useState(false);
  const [vinculoMsg, setVinculoMsg] = useState("");

  useEffect(() => {
    fetch(`/api/pedidos/${id}`)
      .then(r => r.json())
      .then(data => {
        setPedido(data);
        setStatus(data.status);
        setObs(data.obs ?? "");
        setExcursaoSelecionada(data.excursaoId ?? "");
      })
      .finally(() => setLoading(false));
    // Carrega excursões ativas para o select
    fetch("/api/excursoes?ativo=true")
      .then(r => r.json())
      .then(data => setExcursoes(data.map((e: any) => ({ id: e.id, nome: e.nome }))));
  }, [id]);

  async function salvarVinculo(novoId: string | null) {
    setVinculando(true);
    setVinculoMsg("");
    try {
      const res = await fetch(`/api/pedidos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ excursaoId: novoId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao salvar vínculo.");
      setPedido((prev: any) => ({
        ...prev,
        excursaoId: novoId,
        excursao: novoId ? excursoes.find(e => e.id === novoId) ?? null : null,
      }));
      setExcursaoSelecionada(novoId ?? "");
      setVinculoMsg(novoId ? "Excursão vinculada!" : "Vínculo removido.");
      setTimeout(() => setVinculoMsg(""), 3000);
    } catch (err: any) {
      setVinculoMsg(err.message);
    } finally {
      setVinculando(false);
    }
  }

  async function salvarStatus() {
    setSaving(true);
    await fetch(`/api/pedidos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, obs }),
    });
    setSaving(false);
    router.push("/pedidos");
  }

  if (loading) return <div className="text-gray-400 p-8">Carregando...</div>;
  if (!pedido) return <div className="text-red-500 p-8">Pedido não encontrado.</div>;

  const nomeCliente = pedido.cliente?.nome ?? pedido.nomeClienteAvulso ?? "—";
  const telefone = pedido.cliente?.telefone ?? pedido.telefoneClienteAvulso ?? "—";

  // Dados de excursão (JSON)
  const excursao = parseJsonSafe(pedido.excursaoTexto);
  // Dados de endereço Correios (JSON)
  const endereco = parseJsonSafe(pedido.enderecoEntrega);

  return (
    <div className="max-w-3xl space-y-6">
      {/* ── Cabeçalho ────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pedido #{pedido.numero}</h1>
          <p className="text-gray-500 text-sm">{new Date(pedido.criadoEm).toLocaleString("pt-BR")}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()}
            className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 transition">
            <Printer size={15} /> Imprimir
          </button>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[pedido.status]}`}>
            {pedido.status}
          </span>
        </div>
      </div>

      {/* ── Dados do cliente ─────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-400 text-xs mb-1">Cliente</p>
          <p className="font-medium">{nomeCliente}</p>
          <p className="text-gray-500">{telefone}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-1">Catálogo</p>
          <p className="font-medium">{pedido.catalogo}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs mb-1">Pagamento</p>
          <p className="font-medium">{pedido.formaPagamento === "VISTA" ? "PIX / Depósito (À Vista)" : "Cartão / Boleto (A Prazo)"}</p>
        </div>
        {pedido.vendedor && (
          <div>
            <p className="text-gray-400 text-xs mb-1">Vendedor</p>
            <p className="font-medium">{pedido.vendedor.usuario.nome}</p>
          </div>
        )}
        <div>
          <p className="text-gray-400 text-xs mb-1">Envio</p>
          <p className="font-medium">{pedido.tipoEnvio === "RETIRADA_LOJA" ? "Retirada na Loja" : pedido.tipoEnvio === "CORREIOS" ? "Correios" : "Excursão"}</p>
          {pedido.lojaRetirada && <p className="text-gray-500 text-xs">{pedido.lojaRetirada.nome} — {pedido.lojaRetirada.cidade}</p>}
        </div>
      </div>

      {/* ── Endereço Correios ────────────────── */}
      {endereco && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-sm">
          <p className="text-gray-400 text-xs mb-2 font-medium">Endereço de Entrega (Correios)</p>
          <p>{endereco.rua}, {endereco.numero} {endereco.complemento && `— ${endereco.complemento}`}</p>
          <p>{endereco.bairro} — {endereco.cidade}</p>
          <p>CEP: {endereco.cep}</p>
          {endereco.referencia && <p className="text-gray-500 mt-1">Ref: {endereco.referencia}</p>}
        </div>
      )}

      {/* ── Dados da excursão ────────────────── */}
      {excursao && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-sm">
          <p className="text-gray-400 text-xs mb-2 font-medium">Dados da Excursão</p>
          <div className="grid grid-cols-2 gap-2">
            {excursao.nome && <div><p className="text-xs text-gray-400">Nome</p><p className="font-medium">{excursao.nome}</p></div>}
            {excursao.telefone && <div><p className="text-xs text-gray-400">Telefone</p><p className="font-medium">{excursao.telefone}</p></div>}
            {excursao.cidadeOrigem && <div><p className="text-xs text-gray-400">Cidade de origem</p><p className="font-medium">{excursao.cidadeOrigem}</p></div>}
            {excursao.cidadeEntrega && <div><p className="text-xs text-gray-400">Entrega em</p><p className="font-medium">{excursao.cidadeEntrega}</p></div>}
            {excursao.local && <div className="col-span-2"><p className="text-xs text-gray-400">Local / Setor</p><p className="font-medium">{excursao.local}</p></div>}
          </div>
        </div>
      )}

      {/* ── Vincular Excursão ────────────────── */}
      {pedido.tipoEnvio === "EXCURSAO" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-sm print:hidden">
          <div className="flex items-center gap-2 mb-4">
            <Truck size={16} className={pedido.excursao ? "text-green-500" : "text-gray-300"} />
            <h2 className="font-semibold text-gray-700">Vincular Excursão Cadastrada</h2>
          </div>

          {pedido.excursao ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                <div>
                  <p className="font-medium text-green-800">{pedido.excursao.nome}</p>
                  <p className="text-xs text-green-600 mt-0.5">Excursão vinculada</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/excursoes/${pedido.excursaoId}`}
                    className="text-green-700 hover:text-green-900 transition" title="Ver excursão">
                    <ExternalLink size={14} />
                  </Link>
                  <button
                    onClick={() => salvarVinculo(null)}
                    disabled={vinculando}
                    className="text-red-400 hover:text-red-600 transition disabled:opacity-40" title="Desvincular">
                    <X size={14} />
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={excursaoSelecionada}
                  onChange={e => setExcursaoSelecionada(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
                  <option value="">— Trocar excursão —</option>
                  {excursoes.filter(e => e.id !== pedido.excursaoId).map(e => (
                    <option key={e.id} value={e.id}>{e.nome}</option>
                  ))}
                </select>
                <button
                  disabled={!excursaoSelecionada || vinculando}
                  onClick={() => salvarVinculo(excursaoSelecionada)}
                  className="px-4 py-2 bg-black text-white rounded-lg text-sm disabled:opacity-40 hover:bg-gray-800 transition">
                  Trocar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-400 text-xs">
                Este pedido ainda não está vinculado a nenhuma excursão cadastrada.
              </p>
              <div className="flex gap-2">
                <select
                  value={excursaoSelecionada}
                  onChange={e => setExcursaoSelecionada(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black">
                  <option value="">Selecionar excursão...</option>
                  {excursoes.map(e => (
                    <option key={e.id} value={e.id}>{e.nome}</option>
                  ))}
                </select>
                <button
                  disabled={!excursaoSelecionada || vinculando}
                  onClick={() => salvarVinculo(excursaoSelecionada)}
                  className="px-4 py-2 bg-black text-white rounded-lg text-sm disabled:opacity-40 hover:bg-gray-800 transition">
                  {vinculando ? "..." : "Vincular"}
                </button>
              </div>
            </div>
          )}

          {vinculoMsg && (
            <p className={`text-xs mt-2 ${vinculoMsg.includes("!") ? "text-green-600" : "text-red-500"}`}>
              {vinculoMsg}
            </p>
          )}
        </div>
      )}

      {/* ── Itens do pedido ──────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600" colSpan={2}>Produto / Referência</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Qtd</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Unitário</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pedido.itens.map((item: any) => {
              const foto = item.variante.cor.imagens?.find((i: any) => i.principal)?.url
                ?? item.variante.cor.imagens?.[0]?.url
                ?? null;
              return (
                <tr key={item.id}>
                  <td className="px-4 py-3 w-16">
                    {foto
                      ? <img src={foto} alt={item.variante.produto.nome} className="w-14 h-14 object-cover rounded-lg bg-gray-100" />
                      : <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-300">Sem foto</div>
                    }
                  </td>
                  <td className="px-2 py-3">
                    <p className="font-mono text-xs text-gray-400 mb-0.5">{item.variante.produto.codigo}</p>
                    <p className="font-medium">{item.variante.produto.nome}</p>
                    <p className="text-xs text-gray-400">{item.variante.cor.nome} — {item.variante.gradeItem.valor}</p>
                  </td>
                  <td className="px-4 py-3 text-center">{item.quantidade}</td>
                  <td className="px-4 py-3 text-right">{formatMoeda(Number(item.precoUnitario))}</td>
                  <td className="px-4 py-3 text-right">{formatMoeda(Number(item.subtotal))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-sm space-y-1">
          {Number(pedido.valorFrete) > 0 && (
            <div className="flex justify-between text-gray-500">
              <span>Frete</span><span>{formatMoeda(Number(pedido.valorFrete))}</span>
            </div>
          )}
          {Number(pedido.desconto) > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Desconto</span><span>- {formatMoeda(Number(pedido.desconto))}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-base">
            <span>Total</span><span>{formatMoeda(Number(pedido.total))}</span>
          </div>
        </div>
      </div>

      {/* ── Atualizar status ─────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4 print:hidden">
        <h2 className="font-semibold text-gray-700">Atualizar Status</h2>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(s => (
            <button key={s} type="button" onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${status === s ? "bg-black text-white border-black" : "bg-white text-gray-500 border-gray-200"}`}>
              {s}
            </button>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
          <textarea value={obs} onChange={e => setObs(e.target.value)} rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()}
            className="flex-1 border border-gray-200 rounded-lg py-2 text-sm hover:bg-gray-50 transition">Voltar</button>
          <button type="button" onClick={salvarStatus} disabled={saving}
            className="flex-1 bg-black text-white rounded-lg py-2 text-sm hover:bg-gray-800 transition disabled:opacity-50">
            {saving ? "Salvando..." : "Salvar Status"}
          </button>
        </div>
      </div>
    </div>
  );
}
