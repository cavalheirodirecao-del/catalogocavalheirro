import { prisma } from "@/lib/prisma";

type EventoWebhook = "pedido.criado" | "pedido.status_atualizado";

interface PedidoWebhook {
  numero: number;
  status: string;
  catalogo: string;
  cliente: string | null;
  telefone: string | null;
  total: number;
  frete: number;
  formaPagamento: string;
  tipoEnvio: string;
  criadoEm: string;
}

export async function dispararWebhook(evento: EventoWebhook, pedido: PedidoWebhook) {
  try {
    const config = await prisma.configuracaoGeral.findFirst();
    if (!config?.webhookAtivo || !config?.webhookDataCrazyUrl) return;
    if (!config.webhookDataCrazyUrl.startsWith("https://")) return;

    const payload = {
      evento,
      pedido,
      timestamp: new Date().toISOString(),
    };

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (config.webhookDataCrazyToken) {
      headers["Authorization"] = `Bearer ${config.webhookDataCrazyToken}`;
    }

    // Fire-and-forget — não bloqueia a resposta
    fetch(config.webhookDataCrazyUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    }).catch(() => { /* ignora erros de webhook */ });
  } catch {
    // ignora erros de configuração
  }
}
