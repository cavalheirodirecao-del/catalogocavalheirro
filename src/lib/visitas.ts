import { prisma } from "./prisma";

async function geoIP(ip: string): Promise<{ estado: string | null; cidade: string | null; pais: string | null }> {
  if (!ip || ip === "::1" || ip.startsWith("127.") || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return { estado: null, cidade: null, pais: null };
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,regionName,city`, {
      signal: AbortSignal.timeout(3000),
      cache: "no-store",
    });
    const d = await res.json();
    if (d.status === "success") {
      return { pais: d.country ?? null, estado: d.regionName ?? null, cidade: d.city ?? null };
    }
  } catch { /* ignora */ }
  return { estado: null, cidade: null, pais: null };
}

export async function logVisita(
  catalogo: "ATACADO" | "FABRICA" | "VAREJO",
  ip: string | null,
  vendedorSlug?: string | null,
  afiliadoSlug?: string | null,
) {
  let vendedorId: string | null = null;
  if (vendedorSlug) {
    const v = await prisma.vendedor.findUnique({ where: { slug: vendedorSlug }, select: { id: true } });
    vendedorId = v?.id ?? null;
  }
  let afiliadoId: string | null = null;
  if (afiliadoSlug) {
    const a = await prisma.afiliado.findUnique({ where: { slug: afiliadoSlug }, select: { id: true } });
    afiliadoId = a?.id ?? null;
  }
  const geo = ip ? await geoIP(ip) : { estado: null, cidade: null, pais: null };
  await prisma.visita.create({ data: { catalogo, vendedorId, afiliadoId, ip, ...geo } });
}
