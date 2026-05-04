import Link from "next/link";
import { ArrowLeft, ArrowRight, Package, Share2 } from "lucide-react";

export default function CadastroSeletorPage() {
  return (
    <div className="bg-[#0E1117] min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/afiliados"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm font-dm-sans mb-10 transition"
        >
          <ArrowLeft size={14} />
          Programa de Afiliados
        </Link>

        <div className="mb-10 text-center">
          <p className="font-space-mono text-xs tracking-[0.3em] text-[#B8965A]/70 uppercase mb-2">
            Inscrição gratuita
          </p>
          <h1 className="font-bebas text-5xl text-white tracking-wide">ESCOLHA SEU PROGRAMA</h1>
          <p className="text-white/40 text-sm font-dm-sans mt-2">
            Selecione o modelo que faz sentido para o seu perfil.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Varejo */}
          <Link
            href="/afiliados/cadastro/varejo"
            className="group bg-white/[0.03] border border-white/10 hover:border-[#B8965A]/40 rounded-2xl p-6 flex flex-col gap-4 transition"
          >
            <div className="w-12 h-12 rounded-xl bg-[#B8965A]/10 border border-[#B8965A]/20 flex items-center justify-center text-2xl">
              👕
            </div>
            <div>
              <h2 className="font-bebas text-2xl text-white tracking-wide leading-none mb-1">
                Afiliado Varejo
              </h2>
              <p className="text-sm text-white/40 font-dm-sans leading-relaxed">
                Receba peças em casa a cada 15 dias + link exclusivo. Ideal para criadores de conteúdo de moda.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-auto">
              <Package size={13} className="text-[#B8965A]" />
              <span className="text-xs font-dm-sans text-[#B8965A]">Inclui kit de peças</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-1">
              <span className="text-xs text-white/30 font-dm-sans">Comissão: 2% a 10%</span>
              <ArrowRight size={14} className="text-white/30 group-hover:text-[#B8965A] transition" />
            </div>
          </Link>

          {/* Atacado */}
          <Link
            href="/afiliados/cadastro/atacado"
            className="group bg-white/[0.03] border border-white/10 hover:border-[#B8965A]/40 rounded-2xl p-6 flex flex-col gap-4 transition"
          >
            <div className="w-12 h-12 rounded-xl bg-[#B8965A]/10 border border-[#B8965A]/20 flex items-center justify-center text-2xl">
              🔥
            </div>
            <div>
              <h2 className="font-bebas text-2xl text-white tracking-wide leading-none mb-1">
                Afiliado Atacado
              </h2>
              <p className="text-sm text-white/40 font-dm-sans leading-relaxed">
                Só link + comissão. Foco em volume e ofertas de revenda. Sem receber peças em casa.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-auto">
              <Share2 size={13} className="text-[#B8965A]" />
              <span className="text-xs font-dm-sans text-[#B8965A]">Apenas link + comissão</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-1">
              <span className="text-xs text-white/30 font-dm-sans">Comissão: 0,5% a 5%</span>
              <ArrowRight size={14} className="text-white/30 group-hover:text-[#B8965A] transition" />
            </div>
          </Link>
        </div>

        <p className="text-center text-xs text-white/25 font-dm-sans mt-8">
          Já tem conta?{" "}
          <Link href="/afiliados/login" className="text-[#B8965A] hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}
