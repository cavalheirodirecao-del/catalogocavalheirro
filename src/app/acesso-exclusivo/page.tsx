"use client";
import { useEffect, useState } from "react";
export default function AcessoExclusivo() {
  const [token, setToken] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  useEffect(() => { setToken(window.location.hash.slice(1)); window.history.replaceState(null, "", window.location.pathname); }, []);
  async function ativar() {
    setEnviando(true); setErro("");
    try {
      const r = await fetch("/api/exclusivo/ativar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.erro ?? "Não foi possível ativar o convite.");
      window.location.assign("/fabrica");
    } catch (e) { setErro(e instanceof Error ? e.message : "Erro de conexão."); setEnviando(false); }
  }
  return <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6"><div className="max-w-md w-full border border-white/20 rounded-2xl p-8 space-y-6"><p className="tracking-[.3em] text-sm text-amber-200">CAVALHEIRO · EXCLUSIVO</p><h1 className="text-3xl font-semibold">Uma seleção reservada para você.</h1><p className="text-neutral-300">Catálogo de grandes clientes com acesso liberado pela nossa equipe. Seu convite é pessoal e pode ser ativado uma única vez.</p>{token ? <><button disabled={enviando} onClick={ativar} className="w-full bg-amber-200 text-black rounded-lg p-3 font-semibold disabled:opacity-50">{enviando ? "Ativando…" : "Ativar meu acesso"}</button><p className="text-xs text-neutral-400">Ative no navegador que pretende usar. O acesso dura 7 dias; depois, solicite um novo convite.</p></> : <p className="text-amber-200">Solicite seu convite individual ao atendimento Cavalheiro.</p>}{erro && <p role="alert" className="text-red-300">{erro}</p>}</div></main>;
}
