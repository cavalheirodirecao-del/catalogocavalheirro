"use client";

import { Download, FileSpreadsheet } from "lucide-react";

export default function ExportarProdutosPage() {
  return <div className="max-w-3xl space-y-6">
    <div><h1 className="text-2xl font-bold">Exportar catálogo</h1><p className="text-gray-500 text-sm mt-1">Gere uma planilha com produtos, referências, cores, tamanhos, estoque e preços para usar em outros sistemas.</p></div>
    <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-start gap-4">
      <div className="rounded-lg bg-green-50 text-green-700 p-3"><FileSpreadsheet size={24} /></div>
      <div className="flex-1"><p className="font-semibold">Exportação compatível com Faz Agilizar</p><p className="text-sm text-gray-500 mt-1">O arquivo inclui as colunas de varejo e atacado. Use-o como base para conferir ou alimentar outros canais.</p></div>
      <a href="/api/importacoes/exportar" className="inline-flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800"><Download size={16} /> Baixar CSV</a>
    </div>
  </div>;
}
