import { TipoCatalogo } from "@prisma/client";

export function formatarMoeda(valor: number | string): string {
  const numero = typeof valor === "string" ? parseFloat(valor) : valor;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numero);
}

export function getPreco(
  produto: {
    precoVarejoVista: any;
    precoVarejoPrazo: any;
    precoAtacadoVista: any;
    precoAtacadoPrazo: any;
    precoFabricaVista: any;
    precoFabricaPrazo: any;
  },
  catalogo: TipoCatalogo,
  pagamento: "VISTA" | "PRAZO"
): number {
  if (catalogo === "ATACADO") {
    return pagamento === "VISTA"
      ? Number(produto.precoAtacadoVista)
      : Number(produto.precoAtacadoPrazo);
  }
  if (catalogo === "FABRICA") {
    return pagamento === "VISTA"
      ? Number(produto.precoFabricaVista)
      : Number(produto.precoFabricaPrazo);
  }
  return pagamento === "VISTA"
    ? Number(produto.precoVarejoVista)
    : Number(produto.precoVarejoPrazo);
}

export function pathToCatalogo(path: string): TipoCatalogo {
  const seg = path.split("/")[1]?.toLowerCase();
  if (seg === "atacado") return "ATACADO";
  if (seg === "fabrica") return "FABRICA";
  return "VAREJO";
}

// Gera link do WhatsApp com a mensagem do pedido
export function gerarLinkWhatsApp(
  telefone: string,
  dados: {
    numero: number;
    nomeCliente: string;
    itens: { nome: string; cor: string; tamanho: string; quantidade: number }[];
    total: number;
    tipoEnvio: string;
    excursaoNome?: string;
    lojaNome?: string;
    formaPagamento: string;
    catalogo: string;
  }
): string {
  const linhasItens = dados.itens
    .map((i) => `• ${i.nome} - ${i.tamanho} - ${i.cor} (${i.quantidade}x)`)
    .join("\n");

  const envioTexto =
    dados.tipoEnvio === "EXCURSAO"
      ? `Excursão - ${dados.excursaoNome}`
      : dados.tipoEnvio === "RETIRADA_LOJA"
      ? `Retirada - ${dados.lojaNome}`
      : "Correios";

  const pagamentoTexto =
    dados.formaPagamento === "VISTA" ? "PIX / Depósito" : "Cartão / Boleto";

  const catalogoTexto =
    dados.catalogo === "ATACADO"
      ? "Atacado"
      : dados.catalogo === "FABRICA"
      ? "Fábrica"
      : "Varejo";

  const mensagem = `Novo Pedido! 🛍️
*Pedido #${dados.numero}* — ${catalogoTexto}
━━━━━━━━━━━━━━━━━━
👤 Cliente: ${dados.nomeCliente}

📦 Itens:
${linhasItens}

🚚 Envio: ${envioTexto}
💳 Pagamento: ${pagamentoTexto}
💰 Total: ${formatarMoeda(dados.total)}
━━━━━━━━━━━━━━━━━━
Enviado pelo catálogo Cavalheiro`;

  const fone = telefone.replace(/\D/g, "");
  return `https://wa.me/${fone}?text=${encodeURIComponent(mensagem)}`;
}
