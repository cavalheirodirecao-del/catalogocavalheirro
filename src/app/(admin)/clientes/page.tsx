import { prisma } from "@/lib/prisma";
import { TipoCatalogo } from "@prisma/client";
import Link from "next/link";
import { Plus } from "lucide-react";

const labelTipo: Record<TipoCatalogo, string> = {
  VAREJO:  "Varejo",
  ATACADO: "Atacado",
  FABRICA: "Fábrica",
};

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({
    orderBy: { criadoEm: "desc" },
    include: { _count: { select: { pedidos: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-gray-500 text-sm">{clientes.length} clientes cadastrados</p>
        </div>
        <Link
          href="/clientes/novo"
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition"
        >
          <Plus size={16} />
          Novo Cliente
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Documento</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Telefone</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Cidade/UF</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Tipo</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Pedidos</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {clientes.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{c.nome}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{c.documento ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{c.telefone ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">
                  {c.cidade && c.estado ? `${c.cidade}/${c.estado}` : "—"}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {labelTipo[c.tipo]}
                  </span>
                </td>
                <td className="px-4 py-3 text-center font-medium">{c._count.pedidos}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/clientes/${c.id}`} className="text-blue-600 hover:underline text-xs">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {clientes.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            Nenhum cliente cadastrado.
          </div>
        )}
      </div>
    </div>
  );
}
