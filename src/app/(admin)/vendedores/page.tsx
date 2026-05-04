import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";

const dominios: Record<string, string> = {
  VAREJO:  process.env.NEXT_PUBLIC_DOMINIO_VAREJO  ?? "varejo.cavalheiro.com.br",
  ATACADO: process.env.NEXT_PUBLIC_DOMINIO_ATACADO ?? "atacado.cavalheiro.com.br",
  FABRICA: process.env.NEXT_PUBLIC_DOMINIO_FABRICA ?? "fabrica.cavalheiro.com.br",
};

export default async function VendedoresPage() {
  const vendedores = await prisma.vendedor.findMany({
    include: {
      usuario: true,
      links: true,
      _count: { select: { pedidos: true } },
    },
    orderBy: { usuario: { nome: "asc" } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Vendedores</h1>
          <p className="text-gray-500 text-sm">{vendedores.length} vendedores cadastrados</p>
        </div>
        <Link
          href="/vendedores/novo"
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition"
        >
          <Plus size={16} />
          Novo Vendedor
        </Link>
      </div>

      <div className="space-y-4">
        {vendedores.map((v) => (
          <div key={v.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold">{v.usuario.nome}</p>
                <p className="text-sm text-gray-500">{v.usuario.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Slug: <span className="font-mono">/{v.slug}</span> · {v._count.pedidos} pedidos
                </p>
              </div>
              <Link href={`/vendedores/${v.id}`} className="text-blue-600 hover:underline text-xs">
                Editar
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(["VAREJO", "ATACADO", "FABRICA"] as const).map((tipo) => {
                const link = v.links.find((l) => l.catalogo === tipo);
                const url = `https://${dominios[tipo]}/${v.slug}`;
                return (
                  <div
                    key={tipo}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border ${
                      link?.ativo
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-gray-50 border-gray-200 text-gray-400"
                    }`}
                  >
                    <span className="font-medium">{tipo}</span>
                    {link?.ativo && (
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={11} />
                      </a>
                    )}
                    {!link && <span className="text-gray-300">— inativo</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {vendedores.length === 0 && (
          <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">
            Nenhum vendedor cadastrado.
          </div>
        )}
      </div>
    </div>
  );
}
