import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ROTAS_ADMIN = ["/dashboard", "/produtos", "/estoque", "/pedidos", "/clientes", "/vendedores", "/banners", "/relatorios", "/alcance", "/lojas", "/excursoes", "/cupons", "/configuracoes", "/afiliados", "/usuarios", "/minha-senha"];

const ROTAS_VENDEDOR = ["/pedidos", "/minha-senha"];

const CATALOGOS_VALIDOS = ["atacado", "varejo", "fabrica"] as const;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cookie last-touch: ?ref=slug (afiliado) ou ?vendedor=slug (vendedor interno)
  const refParam = request.nextUrl.searchParams.get("ref");
  const vendParam = request.nextUrl.searchParams.get("vendedor");
  const slugRef = refParam ?? vendParam;

  // Caminhos públicos do módulo de afiliados (sem auth)
  const AFILIADOS_PUBLICO = ["/afiliados", "/afiliados/login", "/afiliados/cadastro"];
  const isAfiladoPublico = AFILIADOS_PUBLICO.includes(pathname);

  // Protege portal do afiliado: /afiliados/dashboard*
  if (pathname.startsWith("/afiliados/dashboard")) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || (token as any).perfil !== "AFILIADO") {
      const res = NextResponse.redirect(new URL("/afiliados/login", request.url));
      if (slugRef) {
        res.cookies.set("_ref", slugRef, { maxAge: 60 * 60 * 24 * 7, path: "/", sameSite: "lax", httpOnly: true });
      }
      return res;
    }
  }

  // Protege rotas admin (painel) — exceto os caminhos públicos de afiliados
  const isRotaAdmin = ROTAS_ADMIN.some((rota) => pathname.startsWith(rota));
  if (isRotaAdmin && !isAfiladoPublico && !pathname.startsWith("/afiliados/dashboard")) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if ((token as any).perfil === "VENDEDOR") {
      const permitido = ROTAS_VENDEDOR.some(
        (r) => pathname === r || pathname.startsWith(r + "/")
      );
      if (!permitido) {
        return NextResponse.redirect(new URL("/pedidos", request.url));
      }
    }
  }

  // Detecta catálogo pelo path: /atacado, /varejo, /fabrica
  const segmento = pathname.split("/")[1]?.toLowerCase();
  let catalogo = "VAREJO";
  if (segmento === "atacado") catalogo = "ATACADO";
  else if (segmento === "fabrica") catalogo = "FABRICA";
  else if (segmento === "varejo") catalogo = "VAREJO";

  // Se há slug de rastreamento na URL, seta cookie e retorna
  if (slugRef) {
    const res = NextResponse.next();
    res.cookies.set("_ref", slugRef, { maxAge: 60 * 60 * 24 * 7, path: "/", sameSite: "lax", httpOnly: true });
    res.headers.set("x-catalogo", catalogo);
    res.headers.set("x-pathname", pathname);
    return res;
  }

  const response = NextResponse.next();
  response.headers.set("x-catalogo", catalogo);
  response.headers.set("x-pathname", pathname);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
