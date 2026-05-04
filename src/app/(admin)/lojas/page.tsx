import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, MapPin } from "lucide-react";

export default async function LojasPage() {
  const lojas = await prisma.loja.findMany({
    orderBy: { nome: "asc" },
    include: {
      _count: { select: { pedidos: true } },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Lojas</h1>
          <p className="text-gray-500 text-sm">Pontos de retirada e base das excursões</p>
        </div>
        <Link
          href="/lojas/nova"
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition"
        >
          <Plus size={16} />
          Nova Loja
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {lojas.map((loja) => (
          <div key={loja.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <MapPin size={18} className="text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold">{loja.nome}</p>
                  <p className="text-sm text-gray-500">{loja.cidade}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${loja.ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                {loja.ativo ? "Ativa" : "Inativa"}
              </span>
            </div>
            {loja.endereco && (
              <p className="text-xs text-gray-400 mt-3">{loja.endereco}</p>
            )}
            <div className="flex gap-4 mt-3 text-xs text-gray-500">
              <span>{loja._count.pedidos} retiradas</span>
            </div>
            <Link href={`/lojas/${loja.id}`} className="block mt-3 text-xs text-blue-600 hover:underline">
              Editar
            </Link>
          </div>
        ))}
        {lojas.length === 0 && (
          <p className="col-span-3 text-center text-gray-400 py-12">Nenhuma loja cadastrada.</p>
        )}
      </div>
    </div>
  );
}
