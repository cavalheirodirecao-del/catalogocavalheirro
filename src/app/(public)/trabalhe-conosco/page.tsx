import type { Metadata } from "next";
import TrabalheConoscoClient from "./TrabalheConoscoClient";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trabalhe Conosco | Cavalheiro",
  description: "Faça parte da equipe Cavalheiro. Oportunidades de emprego em moda, varejo e produção no Polo do Agreste Pernambucano.",
  openGraph: {
    title: "Trabalhe Conosco | Cavalheiro",
    description: "Faça parte da equipe Cavalheiro. Oportunidades em moda e varejo no Nordeste.",
    type: "website",
  },
};

export default async function TrabalheConoscoPage() {
  const config = await prisma.configuracaoGeral.findFirst().catch(() => null);
  return (
    <TrabalheConoscoClient
      googleFormUrl={config?.googleFormUrl ?? null}
      fotos={{
        fabrica1:  config?.fotoTrabalhoFabrica1  ?? "",
        fabrica2:  config?.fotoTrabalhoFabrica2  ?? "",
        equipe:    config?.fotoTrabalhoEquipe    ?? "",
        showroom1: config?.fotoTrabalhoShowroom1 ?? "",
        showroom2: config?.fotoTrabalhoShowroom2 ?? "",
      }}
    />
  );
}
