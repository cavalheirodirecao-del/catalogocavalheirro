"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AfiliadoLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password: senha,
      redirect: false,
    });

    if (result?.error) {
      if (result.error === "CredentialsSignin") {
        setErro("E-mail ou senha inválidos.");
      } else {
        setErro("Erro ao fazer login. Tente novamente.");
      }
      setLoading(false);
      return;
    }

    // Verifica o perfil — se não for afiliado, redireciona para admin
    const res = await fetch("/api/afiliados/me");
    if (res.status === 401) {
      setErro("Conta não é de afiliado.");
      setLoading(false);
      return;
    }

    const dados = await res.json();
    if (dados.status === "PENDENTE") {
      setErro("Sua inscrição ainda está em análise. Em breve retornamos!");
      setLoading(false);
      return;
    }
    if (dados.status === "REJEITADO") {
      setErro("Sua inscrição não foi aprovada.");
      setLoading(false);
      return;
    }
    if (dados.status === "SUSPENSO") {
      setErro("Sua conta está suspensa. Entre em contato com o suporte.");
      setLoading(false);
      return;
    }

    router.push("/afiliados/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      {/* Fundo sutil */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, white 0px, white 1px, transparent 1px, transparent 12px)",
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#B8954A] to-transparent" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <p className="font-bebas text-3xl tracking-[0.3em] text-white">CAVALHEIRO</p>
          <p className="text-white/30 text-sm font-dm-sans mt-1">Portal do Afiliado</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 space-y-4"
        >
          {erro && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
              {erro}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-white/40 mb-1.5">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="seu@email.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#B8954A]/50 focus:border-[#B8954A]/40"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/40 mb-1.5">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-[#B8954A]/50 focus:border-[#B8954A]/40"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#B8954A] text-[#0A0A0A] font-dm-sans font-bold text-sm py-3 rounded-xl hover:bg-[#B8954A]/90 transition disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-[#0A0A0A]/30 border-t-[#0A0A0A] rounded-full animate-spin" />
            ) : (
              <>Entrar <ArrowRight size={15} /></>
            )}
          </button>
        </form>

        <div className="text-center mt-6 space-y-2">
          <p className="text-xs text-white/30 font-dm-sans">
            Ainda não é afiliado?{" "}
            <Link href="/afiliados/cadastro" className="text-[#B8954A] hover:underline">
              Inscreva-se
            </Link>
          </p>
          <Link href="/afiliados" className="text-xs text-white/20 hover:text-white/40 font-dm-sans transition">
            Saiba mais sobre o programa →
          </Link>
        </div>
      </div>
    </div>
  );
}
