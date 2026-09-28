"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

let queue: Promise<unknown> = Promise.resolve();
let lastKey = "";
let lastRequest: Promise<unknown> = queue;
export function trackVisit(path: string, query: string) {
  const key = `${path}?${query}`;
  if (key === lastKey) return lastRequest;
  lastKey = key;
  const params = new URLSearchParams(query);
  const catalogo = path.split("/")[1]?.toUpperCase();
  if (!["VAREJO", "ATACADO", "FABRICA"].includes(catalogo)) return queue;
  lastRequest = queue = queue.catch(() => {}).then(async () => {
    const response = await fetch("/api/visitas", { method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true,
      body: JSON.stringify({ catalogo, vendedorSlug: params.get("vendedor"), afiliadoSlug: params.get("ref") }) });
    if (!response.ok) { lastKey = ""; throw new Error("Falha ao registrar visita"); }
  });
  return lastRequest;
}
export async function waitForTracking() { await queue; }
export default function VisitTracker() {
  const path = usePathname();
  const params = useSearchParams();
  const query = params.toString();
  useEffect(() => { void trackVisit(path, query).catch(() => {}); }, [path, query]);
  return null;
}
