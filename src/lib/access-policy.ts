export function isPublicApi(path: string, method: string, query: URLSearchParams) {
  if (method === "GET") {
    if (["/api/catalogo/estoque", "/api/configuracoes", "/api/checkout-dados", "/api/cupons/validar", "/api/keepalive"].includes(path)) return true;
    if (/^\/api\/leads\/[^/]+$/.test(path)) return true;
    return path === "/api/leads" && /^\d{10,15}$/.test((query.get("telefone") ?? "").replace(/\D/g, "")) && ["ATACADO", "FABRICA"].includes(query.get("catalogo") ?? "");
  }
  return method === "POST" && ["/api/pedidos", "/api/visitas", "/api/leads", "/api/afiliados", "/api/frete/calcular"].includes(path);
}

export function canAccessApi(perfil: string, path: string, method: string) {
  if (perfil === "ADMIN") return true;
  if (path === "/api/minha-senha") return true;
  if (perfil === "AFILIADO") return path === "/api/afiliados/me" && method === "GET";
  if (perfil === "VENDEDOR") return method === "GET" && (path === "/api/admin/alcance" || /^\/api\/pedidos(?:\/[^/]+)?$/.test(path));
  if (perfil === "ESTOQUISTA") return path.startsWith("/api/estoque") || (method === "GET" && /^\/api\/(produtos|grades|pedidos)(\/|$)/.test(path)) || (method === "PUT" && /^\/api\/pedidos\/[^/]+$/.test(path));
  if (perfil === "GERENTE") return !/^\/api\/(usuarios|configuracoes)(\/|$)/.test(path) && !(path.startsWith("/api/afiliados") && method !== "GET");
  return false;
}
