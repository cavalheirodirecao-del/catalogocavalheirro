import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { canAccessApi, isPublicApi } from "@/lib/access-policy";

const ADMIN_ROUTES = ["/dashboard", "/produtos", "/estoque", "/pedidos", "/clientes", "/vendedores", "/banners", "/relatorios", "/alcance", "/lojas", "/excursoes", "/cupons", "/configuracoes", "/afiliados", "/usuarios", "/minha-senha", "/leads", "/catalogos", "/categorias", "/posts"];
const under = (path: string, base: string) => path === base || path.startsWith(base + "/");

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (path.startsWith("/api/")) {
    if (isPublicApi(path, req.method, req.nextUrl.searchParams)) return NextResponse.next();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
    if (!canAccessApi(String(token.perfil), path, req.method)) return NextResponse.json({ erro: "Sem permissão." }, { status: 403 });
    return NextResponse.next();
  }
  const publicAffiliate = path === "/afiliados" || path === "/afiliados/login" || under(path, "/afiliados/cadastro");
  if (ADMIN_ROUTES.some(base => under(path, base)) && !publicAffiliate) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const affiliatePortal = under(path, "/afiliados/dashboard");
    if (!token) return NextResponse.redirect(new URL(affiliatePortal ? "/afiliados/login" : "/login", req.url));
    const perfil = String(token.perfil);
    if (affiliatePortal && perfil !== "AFILIADO") return NextResponse.redirect(new URL("/pedidos", req.url));
    if (!affiliatePortal && perfil === "AFILIADO") return NextResponse.redirect(new URL("/afiliados/dashboard", req.url));
    if (perfil === "VENDEDOR" && !["/pedidos", "/alcance", "/minha-senha"].some(base => under(path, base))) return NextResponse.redirect(new URL("/alcance", req.url));
    if (perfil === "ESTOQUISTA" && !["/pedidos", "/estoque", "/produtos", "/minha-senha"].some(base => under(path, base))) return NextResponse.redirect(new URL("/pedidos", req.url));
  }
  return NextResponse.next();
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"] };
