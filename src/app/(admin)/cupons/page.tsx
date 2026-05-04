import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import { formatarMoeda } from "@/lib/utils";
import { TipoCupom } from "@prisma/client";

const labelTipo: Record<TipoCupom, string> = {
  PERCENTUAL:   "% Desconto",
  VALOR_FIXO:   "R$ Fixo",
  FRETE_GRATIS: "Frete Grátis",
};

export default async function CuponsPage() {
  const cupons = await prisma.cupom.findMany({
    orderBy: { criadoEm: "desc" },
    include: { _count: { select: { pedidos: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Cupons de Desconto</h1>
          <p className="text-gray-500 text-sm">{cupons.length} cupons cadastrados</p>
        </div>
        <Link
          href="/cupons/novo"
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition"
        >
          <Plus size={16} />
          Novo Cupom
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Código</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Valor</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Validade</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Usos</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {cupons.map((c) => {
              const expirado = c.validade ? new Date() > c.validade : false;
              return (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-bold tracking-wide">{c.codigo}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                      {labelTipo[c.tipo]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {c.tipo === "PERCENTUAL" && c.valor ? `${Number(c.valor)}%` : ""}
                    {c.tipo === "VALOR_FIXO" && c.valor ? formatarMoeda(Number(c.valor)) : ""}
                    {c.tipo === "FRETE_GRATIS" ? "—" : ""}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {c.validade
                      ? new Date(c.validade).toLocaleDateString("pt-BR")
                      : "Sem validade"}
                  </td>
                  <td className="px-4 py-3 text-center">{c._count.pedidos}x</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      !c.ativo || expirado
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {!c.ativo ? "Inativo" : expirado ? "Expirado" : "Ativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/cupons/${c.id}`} className="text-blue-600 hover:underline text-xs">Editar</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {cupons.length === 0 && (
          <div className="text-center py-12 text-gray-400">Nenhum cupom cadastrado.</div>
        )}
      </div>
    </div>
  );
}
