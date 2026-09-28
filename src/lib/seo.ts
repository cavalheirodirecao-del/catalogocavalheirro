import type { Metadata } from "next";

export const SITE_URL = "https://catalogocavalheirro.vercel.app";
export const publicPages: Record<string, [string, string]> = {
  varejo: ["Moda masculina e jeanswear", "Conheça a coleção Cavalheiro: confira modelos, cores, tamanhos e preços no catálogo de varejo de moda masculina."],
  atacado: ["Moda masculina no atacado", "Explore o catálogo de atacado Cavalheiro para revendedores. Escolha modelos, cores e tamanhos para montar seu pedido."],
  sobre: ["Sobre a Cavalheiro", "Conheça a história da Cavalheiro Jeanswear e nossa marca de moda masculina."],
  contato: ["Contato e atendimento", "Fale com a equipe Cavalheiro e encontre informações de atendimento e da nossa loja em Caruaru, Pernambuco."],
  revendedores: ["Seja um revendedor", "Conheça as opções de revenda da Cavalheiro e acesse o catálogo de moda masculina no atacado."],
  lookbook: ["Lookbook Cavalheiro", "Explore os looks da Cavalheiro e descubra peças da nossa coleção de moda masculina."],
  franquia: ["Franquias Cavalheiro", "Conheça a proposta de franquia Cavalheiro e fale com nossa equipe para saber mais."],
  "trabalhe-conosco": ["Trabalhe conosco", "Conheça a Cavalheiro e as oportunidades para fazer parte da nossa equipe."],
  afiliados: ["Programa de afiliados", "Conheça os programas de afiliados Cavalheiro para varejo e atacado e saiba como participar."],
  blog: ["Blog de moda masculina", "Leia conteúdos da Cavalheiro sobre moda masculina, jeanswear e novidades da marca."],
};

export function pageMetadata(path: string, title: string, description: string): Metadata {
  return {
    title, description,
    alternates: { canonical: `${SITE_URL}/${path}` },
    openGraph: { title, description, url: `${SITE_URL}/${path}`, siteName: "Cavalheiro", locale: "pt_BR", type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
