"use client";

import { useEffect, useState } from "react";
import { Lock, AtSign, Phone, User, Loader2, X, ArrowRight } from "lucide-react";

interface Props {
  catalogo: "ATACADO" | "FABRICA";
  aberto: boolean;
  onClose: () => void;
  onAprovado: () => void;
}

const STORAGE_KEY = "lead_id";

const TEMA = {
  ATACADO: {
    label: "Atacado",
    acento: "#B8954A",
    acentoHover: "#9A7A38",
    badge: "bg-amber-100 text-amber-800",
    ring: "focus:ring-amber-400",
  },
  FABRICA: {
    label: "Fábrica",
    acento: "#D97706",
    acentoHover: "#B45309",
    badge: "bg-yellow-100 text-yellow-800",
    ring: "focus:ring-yellow-400",
  },
};

export default function RegistroWall({ catalogo, aberto, onClose, onAprovado }: Props) {
  const [verificando, setVerificando] = useState(true);
  const [bloqueado, setBloqueado] = useState(false);
  const [aba, setAba] = useState<"novo" | "existente">("novo");

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const [telLogin, setTelLogin] = useState("");
  const [enviandoLogin, setEnviandoLogin] = useState(false);
  const [erroLogin, setErroLogin] = useState("");

  const tema = TEMA[catalogo];

  useEffect(() => {
    const leadId = localStorage.getItem(STORAGE_KEY);
    if (!leadId) { setVerificando(false); return; }
    fetch(`/api/leads/${leadId}`)
      .then(r => r.json())
      .then(data => {
        if (data.status === "ATIVO") { setVerificando(false); onAprovado(); }
        else if (data.status === "BLOQUEADO") { setBloqueado(true); setVerificando(false); }
        else { localStorage.removeItem(STORAGE_KEY); setVerificando(false); }
      })
      .catch(() => { onAprovado(); });
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!telLogin.trim()) { setErroLogin("Informe seu telefone com DDD."); return; }
    setErroLogin(""); setEnviandoLogin(true);
    try {
      const res = await fetch(`/api/leads?telefone=${encodeURIComponent(telLogin.trim())}&catalogo=${catalogo}`);
      const data = await res.json();
      if (!res.ok || !data.id) { setErroLogin("Telefone não encontrado. Verifique o número ou faça o cadastro."); return; }
      localStorage.setItem(STORAGE_KEY, data.id);
      if (data.status === "BLOQUEADO") { setBloqueado(true); }
      else { onAprovado(); onClose(); }
    } catch { setErroLogin("Erro de conexão. Tente novamente."); }
    finally { setEnviandoLogin(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !telefone.trim()) { setErro("Nome e telefone são obrigatórios."); return; }
    setErro(""); setEnviando(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim(), telefone: telefone.trim(), instagram: instagram.trim() || null, catalogo }),
      });
      const data = await res.json();
      if (data.id) {
        localStorage.setItem(STORAGE_KEY, data.id);
        localStorage.setItem("lead_dados", JSON.stringify({ nome: nome.trim(), telefone: telefone.trim() }));
        if (data.status === "BLOQUEADO") { setBloqueado(true); }
        else { onAprovado(); onClose(); }
      } else { setErro("Erro ao realizar cadastro. Tente novamente."); }
    } catch { setErro("Erro de conexão. Tente novamente."); }
    finally { setEnviando(false); }
  }

  if (verificando) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <Loader2 size={28} className="animate-spin text-white" />
      </div>
    );
  }

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-[420px] sm:rounded-2xl shadow-2xl overflow-hidden">

        {/* ── Header escuro ───────────────────────────────── */}
        <div
          className="relative px-8 pt-8 pb-6 overflow-hidden"
          style={{ backgroundColor: "#0A0A0A" }}
        >
          {/* Textura diagonal sutil */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "repeating-linear-gradient(45deg, white 0px, white 1px, transparent 1px, transparent 12px)",
            }}
          />
          {/* Linha de acento no topo */}
          <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: tema.acento }} />

          {/* Botão fechar */}
          {!bloqueado && (
            <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white/80 transition z-10">
              <X size={18} />
            </button>
          )}

          <div className="relative z-10">
            {/* Marca */}
            <p className="font-bebas text-3xl tracking-[0.2em] text-white leading-none mb-1">
              CAVALHEIRO
            </p>
            {/* Badge catálogo */}
            <span
              className="inline-block text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded"
              style={{ backgroundColor: tema.acento + "25", color: tema.acento, border: `1px solid ${tema.acento}40` }}
            >
              {tema.label}
            </span>

            <p className="text-white/50 text-sm mt-3 leading-snug">
              Acesse os preços do catálogo B2B
            </p>
          </div>
        </div>

        {/* ── Corpo ───────────────────────────────────────── */}
        {bloqueado ? (
          <div className="px-8 py-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
              <Lock size={18} className="text-red-400" />
            </div>
            <p className="font-semibold text-gray-900">Acesso bloqueado</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Seu acesso foi bloqueado. Entre em contato com nossa equipe.
            </p>
          </div>
        ) : (
          <div className="px-8 py-6 space-y-5">

            {/* Abas — underline style */}
            <div className="flex border-b border-gray-100">
              {(["novo", "existente"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => { setAba(a); setErro(""); setErroLogin(""); }}
                  className="flex-1 pb-3 text-sm font-medium transition relative"
                  style={{ color: aba === a ? "#0A0A0A" : "#9CA3AF" }}
                >
                  {a === "novo" ? "Primeiro acesso" : "Já tenho cadastro"}
                  {aba === a && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                      style={{ backgroundColor: tema.acento }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* ── Aba: Primeiro acesso ── */}
            {aba === "novo" && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <Field label="Nome completo" required>
                  <InputLine
                    icon={<User size={13} />}
                    type="text" value={nome} onChange={e => setNome(e.target.value)}
                    placeholder="Seu nome" acento={tema.acento}
                  />
                </Field>

                <Field label="WhatsApp / Telefone" required>
                  <InputLine
                    icon={<Phone size={13} />}
                    type="tel" value={telefone} onChange={e => setTelefone(e.target.value)}
                    placeholder="(81) 99999-9999" acento={tema.acento}
                  />
                </Field>

                <Field label="Instagram da loja" hint="opcional">
                  <InputLine
                    icon={<AtSign size={13} />}
                    type="text" value={instagram} onChange={e => setInstagram(e.target.value)}
                    placeholder="@sualojavirtual" acento={tema.acento}
                  />
                </Field>

                {erro && <p className="text-xs text-red-500 -mt-2">{erro}</p>}

                <SubmitBtn acento={tema.acento} acentoHover={tema.acentoHover} loading={enviando}>
                  Ver preços agora
                </SubmitBtn>

                <p className="text-[11px] text-gray-300 text-center pb-1">
                  Cadastro gratuito · Sem spam
                </p>
              </form>
            )}

            {/* ── Aba: Já tenho cadastro ── */}
            {aba === "existente" && (
              <form onSubmit={handleLogin} className="space-y-5">
                <p className="text-sm text-gray-400 -mt-1 leading-relaxed">
                  Digite o telefone com DDD que usou no cadastro.
                </p>

                <Field label="WhatsApp / Telefone" required>
                  <InputLine
                    icon={<Phone size={13} />}
                    type="tel" value={telLogin} onChange={e => setTelLogin(e.target.value)}
                    placeholder="(81) 99999-9999" acento={tema.acento} autoFocus
                  />
                </Field>

                {erroLogin && <p className="text-xs text-red-500 -mt-2">{erroLogin}</p>}

                <SubmitBtn acento={tema.acento} acentoHover={tema.acentoHover} loading={enviandoLogin}>
                  Entrar
                </SubmitBtn>

                <p className="text-[11px] text-gray-300 text-center pb-1">
                  Não encontrou?{" "}
                  <button type="button" onClick={() => setAba("novo")}
                    className="underline underline-offset-2"
                    style={{ color: tema.acento }}>
                    Faça o cadastro
                  </button>
                </p>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-componentes internos ──────────────────────────────

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label}
        {required && <span className="text-red-400 text-[10px]">•</span>}
        {hint && <span className="normal-case tracking-normal font-normal text-gray-300">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

function InputLine({ icon, type, value, onChange, placeholder, acento, autoFocus }: {
  icon: React.ReactNode; type: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string; acento: string; autoFocus?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex items-center gap-2.5 pb-2 border-b transition-all duration-200"
      style={{ borderColor: focused ? acento : "#E5E7EB" }}>
      <span style={{ color: focused ? acento : "#D1D5DB" }} className="transition-colors shrink-0">
        {icon}
      </span>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="flex-1 text-sm text-gray-800 placeholder:text-gray-300 bg-transparent outline-none"
      />
    </div>
  );
}

function SubmitBtn({ children, acento, acentoHover, loading }: {
  children: React.ReactNode; acento: string; acentoHover: string; loading: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="group w-full flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50"
      style={{ backgroundColor: acento, color: "#fff" }}
      onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = acentoHover; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = acento; }}
    >
      {loading
        ? <Loader2 size={15} className="animate-spin" />
        : <>{children} <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" /></>
      }
    </button>
  );
}
