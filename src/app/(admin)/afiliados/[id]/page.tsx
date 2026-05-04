"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle, XCircle, PauseCircle, ExternalLink,
  Pencil, X, Save, Loader2, Eye, EyeOff, KeyRound,
} from "lucide-react";
import { formatarMoeda } from "@/lib/utils";
import { calcularTierAfiliado } from "@/lib/afiliados";

interface Pagamento {
  id: string; periodo: string; valor: number; qtdPedidos: number; status: string; obs: string | null;
}
interface Pedido {
  numero: number; total: string; status: string; criadoEm: string; catalogo: string;
  nomeClienteAvulso: string | null; cliente: { nome: string } | null;
}
interface Afiliado {
  id: string; slug: string; telefone: string | null; instagram: string | null;
  cidade: string | null; estado: string | null; tipo: "VAREJO" | "ATACADO";
  nicho: string | null; seguidores: string | null; comoPromover: string | null;
  status: string; criadoEm: string;
  usuario: { nome: string; email: string; ativo: boolean };
  pagamentos: Pagamento[]; pedidos: Pedido[];
}

const STATUS_LABELS: Record<string, string> = {
  PENDENTE: "Pendente", APROVADO: "Aprovado", REJEITADO: "Rejeitado", SUSPENSO: "Suspenso",
};
const STATUS_COR: Record<string, string> = {
  PENDENTE: "bg-yellow-100 text-yellow-700",
  APROVADO: "bg-green-100 text-green-700",
  REJEITADO: "bg-red-100 text-red-600",
  SUSPENSO: "bg-gray-100 text-gray-600",
};

export default function AfiliadoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [afiliado, setAfiliado] = useState<Afiliado | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Edição de dados
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    nome: "", email: "", telefone: "", instagram: "",
    seguidores: "", nicho: "", cidade: "", estado: "",
    tipo: "VAREJO" as "VAREJO" | "ATACADO",
  });

  // Reset de senha
  const [painelSenha, setPainelSenha] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [senhaOk, setSenhaOk] = useState(false);

  async function carregar() {
    const data = await fetch(`/api/afiliados/${id}`).then(r => r.json());
    setAfiliado(data);
    setForm({
      nome: data.usuario.nome,
      email: data.usuario.email,
      telefone: data.telefone ?? "",
      instagram: data.instagram ?? "",
      seguidores: data.seguidores ?? "",
      nicho: data.nicho ?? "",
      cidade: data.cidade ?? "",
      estado: data.estado ?? "",
      tipo: data.tipo,
    });
    setLoading(false);
  }

  useEffect(() => { carregar(); }, [id]);

  async function mudarStatus(novoStatus: string) {
    if (!confirm(`Confirma alterar status para "${STATUS_LABELS[novoStatus]}"?`)) return;
    setSalvando(true);
    await fetch(`/api/afiliados/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novoStatus }),
    });
    await carregar();
    setSalvando(false);
  }

  async function salvarEdicao() {
    setSalvando(true);
    await fetch(`/api/afiliados/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    await carregar();
    setEditando(false);
    setSalvando(false);
  }

  async function salvarSenha() {
    if (!novaSenha || novaSenha.length < 6) return;
    setSalvandoSenha(true);
    await fetch(`/api/afiliados/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ novaSenha }),
    });
    setSalvandoSenha(false);
    setSenhaOk(true);
    setNovaSenha("");
    setTimeout(() => { setSenhaOk(false); setPainelSenha(false); }, 2000);
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
    </div>
  );
  if (!afiliado) return <p className="text-red-500">Afiliado não encontrado.</p>;

  const qtdVendas = afiliado.pedidos.length;
  const { pct, nivel, faixa } = calcularTierAfiliado(qtdVendas, afiliado.tipo);

  const campo = "w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400";

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{afiliado.usuario.nome}</h1>
          <p className="text-gray-400 text-sm font-mono">/{afiliado.slug}</p>
        </div>
        <span className={`ml-auto text-xs px-3 py-1 rounded-full font-medium ${STATUS_COR[afiliado.status]}`}>
          {STATUS_LABELS[afiliado.status]}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-6">
        {/* Dados */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="font-semibold text-sm text-gray-800">Dados do Afiliado</h2>
            {!editando ? (
              <button
                onClick={() => setEditando(true)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-2 py-1 rounded transition"
              >
                <Pencil size={12} /> Editar
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={salvarEdicao}
                  disabled={salvando}
                  className="flex items-center gap-1 text-xs bg-gray-900 text-white px-2.5 py-1 rounded hover:bg-gray-700 transition disabled:opacity-50"
                >
                  {salvando ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
                  Salvar
                </button>
                <button
                  onClick={() => setEditando(false)}
                  className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded hover:bg-gray-100 transition"
                >
                  <X size={11} /> Cancelar
                </button>
              </div>
            )}
          </div>

          {editando ? (
            <div className="space-y-3">
              {/* Tipo */}
              <div className="flex gap-2">
                {(["VAREJO", "ATACADO"] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, tipo: t }))}
                    className={`flex-1 border rounded-lg py-1.5 text-xs font-medium transition ${
                      form.tipo === t
                        ? t === "ATACADO"
                          ? "border-amber-400 bg-amber-50 text-amber-800"
                          : "border-blue-400 bg-blue-50 text-blue-800"
                        : "border-gray-200 text-gray-500"
                    }`}
                  >
                    {t === "VAREJO" ? "👕 Varejo" : "🔥 Atacado"}
                  </button>
                ))}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Nome</p>
                <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} className={campo} />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">E-mail</p>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={campo} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Telefone</p>
                  <input value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} className={campo} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Instagram</p>
                  <input value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} className={campo} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Seguidores</p>
                  <input value={form.seguidores} onChange={e => setForm(f => ({ ...f, seguidores: e.target.value }))} className={campo} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Nicho</p>
                  <input value={form.nicho} onChange={e => setForm(f => ({ ...f, nicho: e.target.value }))} className={campo} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Cidade</p>
                  <input value={form.cidade} onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))} className={campo} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Estado</p>
                  <input value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))} className={campo} placeholder="PE" maxLength={2} />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Programa</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  afiliado.tipo === "ATACADO"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-blue-50 text-blue-700 border border-blue-200"
                }`}>
                  {afiliado.tipo === "ATACADO" ? "🔥 Atacado" : "👕 Varejo"}
                </span>
              </div>
              <Row label="Nome"       value={afiliado.usuario.nome} />
              <Row label="E-mail"     value={afiliado.usuario.email} />
              <Row label="Telefone"   value={afiliado.telefone ?? "—"} />
              <Row label="Instagram"  value={afiliado.instagram ?? "—"} />
              {afiliado.seguidores && <Row label="Seguidores" value={afiliado.seguidores} />}
              {afiliado.nicho && <Row label="Nicho" value={afiliado.nicho} />}
              <Row label="Cidade"     value={[afiliado.cidade, afiliado.estado].filter(Boolean).join(", ") || "—"} />
              <Row label="Inscrito em" value={new Date(afiliado.criadoEm).toLocaleDateString("pt-BR")} />
              {afiliado.comoPromover && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Como pretende divulgar</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{afiliado.comoPromover}</p>
                </div>
              )}
            </>
          )}

          {/* Reset de senha */}
          <div className="pt-3 border-t">
            {!painelSenha ? (
              <button
                onClick={() => setPainelSenha(true)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition w-full"
              >
                <KeyRound size={13} />
                Alterar senha do afiliado
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                  <KeyRound size={12} /> Nova senha
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={mostrarSenha ? "text" : "password"}
                      value={novaSenha}
                      onChange={e => setNovaSenha(e.target.value)}
                      placeholder="Mín. 6 caracteres"
                      className={`${campo} pr-8`}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {mostrarSenha ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                  <button
                    onClick={salvarSenha}
                    disabled={salvandoSenha || novaSenha.length < 6}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-40 ${
                      senhaOk
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-900 text-white hover:bg-gray-700"
                    }`}
                  >
                    {salvandoSenha
                      ? <Loader2 size={13} className="animate-spin" />
                      : senhaOk ? "Salvo!" : "Salvar"
                    }
                  </button>
                  <button
                    onClick={() => { setPainelSenha(false); setNovaSenha(""); }}
                    className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition"
                  >
                    <X size={13} />
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">
                  Após salvar, informe a nova senha ao afiliado.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Comissão */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h2 className="font-semibold text-sm text-gray-800 border-b pb-2">Desempenho (mês atual)</h2>
          <Row label="Vendas confirmadas" value={`${qtdVendas} pedidos`} />
          <Row label="Nível atual" value={`${nivel} · ${pct}% · ${faixa}`} />
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-400 mb-1">Links de venda</p>
            {["varejo", "atacado", "fabrica"].map(c => (
              <div key={c} className="flex items-center gap-2 text-xs font-mono text-gray-500 mt-1">
                <span className="text-gray-300">/{c}?ref={afiliado.slug}</span>
                <a href={`/${c}?ref=${afiliado.slug}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={11} className="text-gray-400 hover:text-gray-700" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ações de status */}
      {afiliado.status !== "APROVADO" && (
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => mudarStatus("APROVADO")}
            disabled={salvando}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
          >
            <CheckCircle size={15} /> Aprovar afiliado
          </button>
          {afiliado.status !== "REJEITADO" && (
            <button
              onClick={() => mudarStatus("REJEITADO")}
              disabled={salvando}
              className="flex items-center gap-2 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition disabled:opacity-50"
            >
              <XCircle size={15} /> Rejeitar
            </button>
          )}
        </div>
      )}
      {afiliado.status === "APROVADO" && (
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => mudarStatus("SUSPENSO")}
            disabled={salvando}
            className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
          >
            <PauseCircle size={15} /> Suspender
          </button>
        </div>
      )}

      {/* Pedidos */}
      {afiliado.pedidos.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-5">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-sm">Pedidos vinculados ({afiliado.pedidos.length})</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {afiliado.pedidos.slice(0, 20).map(p => (
              <div key={p.numero} className="px-5 py-3 flex items-center gap-4 text-sm">
                <span className="font-mono font-bold text-gray-700">#{p.numero}</span>
                <span className="flex-1 text-gray-500 truncate">
                  {p.cliente?.nome ?? p.nomeClienteAvulso ?? "—"}
                </span>
                <span className="text-gray-400 text-xs">{p.catalogo}</span>
                <span className="font-semibold">{formatarMoeda(Number(p.total))}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Histórico de pagamentos */}
      {afiliado.pagamentos.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-sm">Histórico de Pagamentos</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {afiliado.pagamentos.map(pg => (
              <div key={pg.id} className="px-5 py-3 flex items-center gap-4 text-sm">
                <span className="font-mono text-gray-500">{pg.periodo}</span>
                <span className="text-gray-500">{pg.qtdPedidos} vendas</span>
                <span className="font-semibold flex-1">{formatarMoeda(Number(pg.valor))}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  pg.status === "PAGO" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                  {pg.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-800 font-medium">{value}</span>
    </div>
  );
}
