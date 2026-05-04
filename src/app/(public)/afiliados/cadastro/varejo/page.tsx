"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";

const ESTADOS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const NICHOS = ["Moda", "Lifestyle", "Humor / Entretenimento", "Comportamento", "Fitness / Saúde", "Outro"];

export default function CadastroVarejoPage() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    telefone: "",
    instagram: "",
    seguidores: "",
    nicho: "",
    cidade: "",
    estado: "",
    // triagem
    experienciaAfiliado: "",
    vendasOnline: "",
    qtdPostagens: "",
    tipoConteudo: "",
    seguirPadrao: "",
    // por que quer
    comoPromover: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (form.seguirPadrao === "Não") {
      setErro("Afiliados devem seguir o padrão de divulgação (link + cupom + marcação). Se não puder, esse programa pode não ser ideal agora.");
      return;
    }

    setEnviando(true);
    try {
      // Concatenar respostas de triagem em comoPromover
      const triagem = [
        `Nicho: ${form.nicho}`,
        `Seguidores: ${form.seguidores}`,
        `Já trabalhou com afiliado: ${form.experienciaAfiliado}`,
        `Já vendeu online: ${form.vendasOnline}`,
        `Postagens/semana: ${form.qtdPostagens}`,
        `Tipo de conteúdo: ${form.tipoConteudo}`,
        `Segue padrão de divulgação: ${form.seguirPadrao}`,
        `Por que quer ser afiliado: ${form.comoPromover}`,
      ].join("\n");

      const res = await fetch("/api/afiliados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          email: form.email,
          senha: form.senha,
          telefone: form.telefone,
          instagram: form.instagram,
          cidade: form.cidade,
          estado: form.estado,
          tipo: "VAREJO",
          nicho: form.nicho,
          seguidores: form.seguidores,
          comoPromover: triagem,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro ?? "Erro ao enviar inscrição.");
      setSucesso(true);
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  if (sucesso) {
    return (
      <div className="bg-[#0E1117] min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#B8965A]/10 border border-[#B8965A]/30 flex items-center justify-center mx-auto">
            <CheckCircle size={32} className="text-[#B8965A]" />
          </div>
          <h1 className="font-bebas text-4xl text-white tracking-wide">INSCRIÇÃO ENVIADA!</h1>
          <p className="text-white/50 font-dm-sans">
            Recebemos sua inscrição no programa <strong className="text-white">Afiliado Varejo</strong>. Em até 48h nossa equipe entrará em contato para confirmar sua aprovação.
          </p>
          <Link href="/afiliados" className="inline-flex items-center gap-2 text-[#B8965A] text-sm font-dm-sans hover:underline">
            <ArrowLeft size={14} />
            Voltar ao programa
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0E1117] min-h-screen py-16 px-4">
      <div className="max-w-xl mx-auto">
        <Link href="/afiliados/cadastro" className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm font-dm-sans mb-8 transition">
          <ArrowLeft size={14} />
          Escolha de programa
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-[#B8965A]/10 border border-[#B8965A]/20 rounded-full px-3 py-1 mb-3">
            <span className="text-sm">👕</span>
            <span className="text-xs font-space-mono tracking-[0.15em] text-[#B8965A] uppercase">Afiliado Varejo</span>
          </div>
          <h1 className="font-bebas text-5xl text-white tracking-wide">QUERO SER AFILIADO</h1>
          <p className="text-white/40 text-sm font-dm-sans mt-2">
            Preencha o formulário abaixo. Analisamos em até 48h.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-5">
          {erro && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {erro}
            </p>
          )}

          <Section title="Dados pessoais" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nome completo *">
              <input type="text" required value={form.nome} onChange={e => set("nome", e.target.value)}
                placeholder="Seu nome" className={INPUT} />
            </Field>
            <Field label="WhatsApp *">
              <input type="tel" required value={form.telefone} onChange={e => set("telefone", e.target.value)}
                placeholder="(81) 99999-9999" className={INPUT} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Cidade">
              <input type="text" value={form.cidade} onChange={e => set("cidade", e.target.value)}
                placeholder="Sua cidade" className={INPUT} />
            </Field>
            <Field label="Estado">
              <select value={form.estado} onChange={e => set("estado", e.target.value)} className={SELECT}>
                <option value="">Selecionar</option>
                {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </Field>
          </div>

          <Section title="Redes sociais" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="E-mail *">
              <input type="email" required value={form.email} onChange={e => set("email", e.target.value)}
                placeholder="seu@email.com" className={INPUT} />
            </Field>
            <Field label="Senha *">
              <input type="password" required minLength={6} value={form.senha} onChange={e => set("senha", e.target.value)}
                placeholder="Mínimo 6 caracteres" className={INPUT} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="@ do Instagram *">
              <input type="text" required value={form.instagram} onChange={e => set("instagram", e.target.value)}
                placeholder="@seu.perfil" className={INPUT} />
            </Field>
            <Field label="Quantidade de seguidores *">
              <input type="text" required value={form.seguidores} onChange={e => set("seguidores", e.target.value)}
                placeholder="Ex: 5k, 20k, 100k" className={INPUT} />
            </Field>
          </div>
          <Field label="Nicho de conteúdo *">
            <select required value={form.nicho} onChange={e => set("nicho", e.target.value)} className={SELECT}>
              <option value="">Selecionar</option>
              {NICHOS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>

          <Section title="Experiência" />

          <RadioGroup label="Já trabalhou com divulgação ou afiliado? *" name="experienciaAfiliado"
            value={form.experienciaAfiliado} onChange={v => set("experienciaAfiliado", v)}
            options={["Sim", "Não"]} />
          <RadioGroup label="Já realizou vendas online? *" name="vendasOnline"
            value={form.vendasOnline} onChange={v => set("vendasOnline", v)}
            options={["Sim", "Não"]} />

          <Section title="Produção de conteúdo" />

          <Field label="Quantas vezes você posta por semana? *">
            <select required value={form.qtdPostagens} onChange={e => set("qtdPostagens", e.target.value)} className={SELECT}>
              <option value="">Selecionar</option>
              <option>1–2x por semana</option>
              <option>3–4x por semana</option>
              <option>5x ou mais por semana</option>
              <option>Diariamente</option>
            </select>
          </Field>
          <RadioGroup label="Você grava vídeos ou apenas fotos? *" name="tipoConteudo"
            value={form.tipoConteudo} onChange={v => set("tipoConteudo", v)}
            options={["Vídeos (reels, stories)", "Fotos", "Ambos"]} />
          <RadioGroup label="Está disposto a seguir um padrão de divulgação (link + cupom + marcação)? *" name="seguirPadrao"
            value={form.seguirPadrao} onChange={v => set("seguirPadrao", v)}
            options={["Sim", "Não"]} />

          <Section title="Por que quer ser afiliado?" />

          <Field label="Conte um pouco sobre seu interesse *">
            <textarea required rows={4} value={form.comoPromover} onChange={e => set("comoPromover", e.target.value)}
              placeholder="Por que você quer ser afiliado da Cavalheiro?"
              className={INPUT + " resize-none"} />
          </Field>

          <button type="submit" disabled={enviando}
            className="w-full bg-[#B8965A] text-[#0E1117] font-dm-sans font-bold text-sm py-4 rounded-xl hover:bg-[#B8965A]/90 transition disabled:opacity-50">
            {enviando ? "Enviando..." : "Enviar inscrição"}
          </button>

          <p className="text-center text-xs text-white/30 font-dm-sans">
            Já tem conta?{" "}
            <Link href="/afiliados/login" className="text-[#B8965A] hover:underline">Fazer login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

const INPUT = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-[#B8965A]/50 focus:border-[#B8965A]/40";
const SELECT = "w-full bg-[#1a1a1a] border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#B8965A]/50 focus:border-[#B8965A]/40 [&>option]:bg-[#1a1a1a] [&>option]:text-white";

function Section({ title }: { title: string }) {
  return (
    <div className="border-t border-white/10 pt-4">
      <p className="text-xs font-space-mono tracking-[0.2em] text-[#B8965A]/60 uppercase">{title}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/50 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function RadioGroup({ label, name, value, onChange, options }: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <Field label={label}>
      <div className="flex flex-wrap gap-3 mt-1">
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name={name} value={opt} checked={value === opt} onChange={() => onChange(opt)}
              className="accent-[#B8965A]" required />
            <span className="text-sm text-white/70 font-dm-sans">{opt}</span>
          </label>
        ))}
      </div>
    </Field>
  );
}
