import { NextRequest, NextResponse } from "next/server";

const CEP_ORIGEM = "55900-000"; // Toritama - PE (configurar via env se necessário)
const TOKEN = process.env.MELHOR_ENVIO_TOKEN ?? "";
const SANDBOX = process.env.MELHOR_ENVIO_SANDBOX === "true";
const BASE_URL = SANDBOX
  ? "https://sandbox.melhorenvio.com.br/api/v2"
  : "https://melhorenvio.com.br/api/v2";

interface ItemFrete {
  quantidade: number;
  pesoGramas: number;
  alturaCm: number;
  larguraCm: number;
  comprimentoCm: number;
  precoUnitario: number;
}

export async function POST(req: NextRequest) {
  try {
    if (!TOKEN) {
      return NextResponse.json(
        { erro: "Token do Melhor Envio não configurado. Adicione MELHOR_ENVIO_TOKEN no .env" },
        { status: 503 }
      );
    }

    const { cepDestino, itens }: { cepDestino: string; itens: ItemFrete[] } = await req.json();
    const cep = cepDestino.replace(/\D/g, "");

    if (!cep || cep.length !== 8) {
      return NextResponse.json({ erro: "CEP inválido." }, { status: 400 });
    }

    // Calcula dimensões e peso total do pacote
    const pesoTotalG = itens.reduce((acc, i) => acc + i.pesoGramas * i.quantidade, 0);
    const pesoKg = Math.max(0.3, pesoTotalG / 1000);

    // Caixa: altura empilhada, largura e comprimento máximos
    const alturaCm = itens.reduce((acc, i) => acc + i.alturaCm * i.quantidade, 0);
    const larguraCm = Math.max(...itens.map(i => i.larguraCm));
    const comprimentoCm = Math.max(...itens.map(i => i.comprimentoCm));

    // Valor declarado (soma dos itens)
    const insuranceValue = itens.reduce((acc, i) => acc + i.precoUnitario * i.quantidade, 0);

    const body = {
      from: { postal_code: CEP_ORIGEM.replace(/\D/g, "") },
      to: { postal_code: cep },
      package: {
        height: Math.max(2, Math.ceil(alturaCm)),
        width: Math.max(11, Math.ceil(larguraCm)),
        length: Math.max(16, Math.ceil(comprimentoCm)),
        weight: pesoKg,
      },
      options: {
        insurance_value: insuranceValue,
        receipt: false,
        own_hand: false,
      },
      services: "1,2,3,4,17", // PAC, SEDEX, Mini, SEDEX 10, SEDEX HOJE + privados
    };

    const res = await fetch(`${BASE_URL}/me/shipment/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
        "User-Agent": "Cavalheiro/1.0 (contato@cavalheiro.com.br)",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ erro: "Erro ao calcular frete.", detalhe: err }, { status: 502 });
    }

    const data = await res.json();

    // Filtra apenas serviços com preço válido
    const opcoes = (Array.isArray(data) ? data : [])
      .filter((s: any) => s.price && !s.error)
      .map((s: any) => ({
        id: String(s.id),
        nome: s.name,
        empresa: s.company?.name ?? "",
        preco: Number(s.price),
        prazoMin: s.delivery_time,
        prazoMax: s.delivery_time,
      }))
      .sort((a: any, b: any) => a.preco - b.preco);

    return NextResponse.json(opcoes);
  } catch (err: any) {
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}
