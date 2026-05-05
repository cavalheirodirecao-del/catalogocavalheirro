"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  UserSquare,
  Image,
  BarChart2,
  Signal,
  LogOut,
  MapPin,
  Truck,
  Tag,
  Settings,
  UserCheck,
  BookOpen,
  Newspaper,
  Plus,
  Warehouse,
  ArrowDownToLine,
  History,
  ChevronDown,
  Users2,
  Wallet,
  KeyRound,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";

const menusSistema = [
  { href: "/lojas",          label: "Lojas",         icon: MapPin },
  { href: "/cupons",         label: "Cupons",        icon: Tag },
  { href: "/configuracoes",  label: "Configurações", icon: Settings },
];

const menusGerais = [
  { href: "/dashboard",   label: "Dashboard",    icon: LayoutDashboard },
  { href: "/pedidos",     label: "Pedidos",      icon: ShoppingCart },
  { href: "/clientes",    label: "Clientes",     icon: Users },
  { href: "/vendedores",  label: "Vendedores",   icon: UserSquare },
  { href: "/leads",       label: "Leads",        icon: UserCheck },
  { href: "/banners",     label: "Banners",      icon: Image },
  { href: "/catalogos",   label: "Catálogos PDF", icon: BookOpen },
  { href: "/posts",       label: "Blog",         icon: Newspaper },
  { href: "/relatorios",  label: "Relatórios",   icon: BarChart2 },
  { href: "/alcance",     label: "Alcance",      icon: Signal    },
];

const subItensProdutos = [
  { href: "/produtos",                       label: "Produtos",          icon: Package },
  { href: "/produtos/novo",                  label: "Novo produto",      icon: Plus },
  { href: "/categorias",                     label: "Categorias",        icon: Tag },
  { href: "/estoque",                        label: "Estoque",           icon: Warehouse },
  { href: "/estoque/movimentacao/nova",      label: "Nova movimentação", icon: ArrowDownToLine },
  { href: "/estoque/movimentacoes",          label: "Histórico",         icon: History },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const perfil = (session?.user as any)?.perfil as string | undefined;
  const isVendedor = perfil === "VENDEDOR";

  const produtosAtivo =
    pathname.startsWith("/produtos") ||
    pathname.startsWith("/estoque") ||
    pathname.startsWith("/categorias");

  const afiliadosAtivo =
    pathname.startsWith("/afiliados");

  const excursoesAtivo =
    pathname.startsWith("/excursoes");

  const [produtosAberto, setProdutosAberto] = useState(produtosAtivo);
  const [afiliadosAberto, setAfiliadosAberto] = useState(afiliadosAtivo);
  const [excursoesAberto, setExcursoesAberto] = useState(excursoesAtivo);

  // Abre automaticamente quando navega para uma rota relevante
  useEffect(() => {
    if (produtosAtivo) setProdutosAberto(true);
    if (afiliadosAtivo) setAfiliadosAberto(true);
    if (excursoesAtivo) setExcursoesAberto(true);
  }, [pathname]);

  function MenuItem({ href, label, icon: Icon }: { href: string; label: string; icon: any }) {
    const ativo = pathname === href || (href !== "/produtos" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
          ativo
            ? "bg-white text-black font-medium"
            : "text-white/70 hover:bg-white/10 hover:text-white"
        }`}
      >
        <Icon size={16} />
        {label}
      </Link>
    );
  }

  return (
    <aside className="w-60 min-h-screen bg-black text-white flex flex-col">
      <div className="px-6 py-5 border-b border-white/10">
        <h1 className="text-lg font-bold tracking-wide">Cavalheiro</h1>
        <p className="text-xs text-white/40 mt-0.5">Painel Administrativo</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-auto">
        {/* Vista simplificada para Vendedor */}
        {isVendedor && (
          <>
            <MenuItem href="/pedidos" label="Pedidos" icon={ShoppingCart} />
            <MenuItem href="/minha-senha" label="Minha Senha" icon={KeyRound} />
          </>
        )}

        {/* Vista completa para Admin/Gerente/Estoquista */}
        {!isVendedor && <>
        {/* Dashboard */}
        <MenuItem href="/dashboard" label="Dashboard" icon={LayoutDashboard} />

        {/* Grupo Produtos (expansível) */}
        <div>
          <button
            onClick={() => setProdutosAberto(!produtosAberto)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
              produtosAtivo
                ? "bg-white/10 text-white font-medium"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Package size={16} />
            <span className="flex-1 text-left">Produtos</span>
            <ChevronDown
              size={14}
              className={`transition-transform ${produtosAberto ? "rotate-180" : ""}`}
            />
          </button>

          {produtosAberto && (
            <div className="ml-4 pl-3 border-l border-white/10 space-y-0.5 mt-0.5">
              {subItensProdutos.map((s) => {
                const ativo =
                  s.href === "/produtos"
                    ? pathname === "/produtos"
                    : pathname === s.href || pathname.startsWith(s.href + "/");
                return (
                  <Link
                    key={s.href}
                    href={s.href}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition ${
                      ativo
                        ? "text-white font-medium bg-white/10"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <s.icon size={13} />
                    {s.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Grupo Afiliados (expansível) */}
        <div>
          <button
            onClick={() => setAfiliadosAberto(!afiliadosAberto)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
              afiliadosAtivo
                ? "bg-white/10 text-white font-medium"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Users2 size={16} />
            <span className="flex-1 text-left">Afiliados</span>
            <ChevronDown
              size={14}
              className={`transition-transform ${afiliadosAberto ? "rotate-180" : ""}`}
            />
          </button>

          {afiliadosAberto && (
            <div className="ml-4 pl-3 border-l border-white/10 space-y-0.5 mt-0.5">
              {[
                { href: "/afiliados/lista", label: "Lista", icon: Users2 },
                { href: "/afiliados/pagamentos", label: "Pagamentos", icon: Wallet },
              ].map((s) => {
                const ativo = pathname === s.href;
                return (
                  <Link
                    key={s.href}
                    href={s.href}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition ${
                      ativo
                        ? "text-white font-medium bg-white/10"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <s.icon size={13} />
                    {s.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Demais menus */}
        {menusGerais.map((m) => <MenuItem key={m.href} {...m} />)}

        <div className="pt-4 pb-1">
          <p className="px-3 text-xs text-white/30 uppercase tracking-wider">Sistema</p>
        </div>

        {/* Grupo Excursões (expansível) */}
        <div>
          <button
            onClick={() => setExcursoesAberto(!excursoesAberto)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
              excursoesAtivo
                ? "bg-white/10 text-white font-medium"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Truck size={16} />
            <span className="flex-1 text-left">Excursões</span>
            <ChevronDown
              size={14}
              className={`transition-transform ${excursoesAberto ? "rotate-180" : ""}`}
            />
          </button>

          {excursoesAberto && (
            <div className="ml-4 pl-3 border-l border-white/10 space-y-0.5 mt-0.5">
              {[
                { href: "/excursoes",           label: "Cadastro",   icon: Truck },
                { href: "/excursoes/dashboard", label: "Dashboard",  icon: BarChart2 },
              ].map((s) => {
                const ativo = pathname === s.href || (s.href !== "/excursoes" && pathname.startsWith(s.href));
                return (
                  <Link
                    key={s.href}
                    href={s.href}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition ${
                      ativo
                        ? "text-white font-medium bg-white/10"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <s.icon size={13} />
                    {s.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {menusSistema.map((m) => <MenuItem key={m.href} {...m} />)}
        <MenuItem href="/usuarios" label="Usuários" icon={Users} />
        <MenuItem href="/minha-senha" label="Minha Senha" icon={KeyRound} />
        </>}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition w-full"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  );
}
