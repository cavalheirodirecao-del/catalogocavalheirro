export type LinhaFazAgilizar = {
  linha: number;
  codigo: string;
  nome: string;
  tamanho: string;
  cor: string;
  estoque: number;
  precoAtacado: number;
};

export type ProdutoImportado = {
  codigo: string;
  nome: string;
  precoAtacado: number;
  variacoes: LinhaFazAgilizar[];
  origem: "ATACADO" | "VAREJO";
};

function csvLinha(linha: string) {
  const campos: string[] = [];
  let campo = "";
  let entreAspas = false;
  for (let i = 0; i < linha.length; i++) {
    const caractere = linha[i];
    if (caractere === '"') {
      if (entreAspas && linha[i + 1] === '"') { campo += '"'; i++; }
      else entreAspas = !entreAspas;
    } else if (caractere === ";" && !entreAspas) {
      campos.push(campo.trim()); campo = "";
    } else campo += caractere;
  }
  campos.push(campo.trim());
  return campos;
}

function moeda(valor: string) {
  const limpo = valor.replace(/[^\d,-]/g, "").replace(/\./g, "").replace(",", ".");
  const numero = Number(limpo);
  return Number.isFinite(numero) ? numero : 0;
}

function quantidade(valor: string) {
  const numero = Number(valor.replace(/\./g, "").replace(",", "."));
  return Number.isInteger(numero) && numero >= 0 ? numero : null;
}

export function lerExportacaoFazAgilizar(csv: string) {
  const linhas = csv.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  const cabecalho = csvLinha(linhas[0] ?? "");
  const produtoIndex = cabecalho.indexOf("Produto");
  const estoqueIndex = cabecalho.indexOf("Estoque Atual");
  const precoAtacadoIndex = cabecalho.indexOf("Valor Venda Atacado");
  const precoVarejoIndex = cabecalho.indexOf("Valor Venda Varejo");
  const precoIndex = precoAtacadoIndex >= 0 ? precoAtacadoIndex : precoVarejoIndex;
  const origem = precoAtacadoIndex >= 0 ? "ATACADO" : "VAREJO";
  const erros: string[] = [];
  const itens: LinhaFazAgilizar[] = [];

  if (produtoIndex < 0 || estoqueIndex < 0 || precoIndex < 0) {
    return { itens, produtos: [] as ProdutoImportado[], origem, erros: ["O arquivo precisa conter as colunas Produto, Estoque Atual e Valor Venda Atacado ou Valor Venda Varejo."] };
  }

  for (let indice = 1; indice < linhas.length; indice++) {
    const campos = csvLinha(linhas[indice]);
    const descricao = campos[produtoIndex] ?? "";
    if (!descricao.trim()) continue;
    const encontrado = descricao.match(/^\s*(.+?)\s*-\s*REF:\s*(.+)\s*-\s*([^()]+?)\s*\(\s*([^)]+?)\s*\)\s*$/i);
    const estoque = quantidade(campos[estoqueIndex] ?? "");
    if (!encontrado || estoque === null) {
      erros.push(`Linha ${indice + 1}: formato de produto ou estoque inválido.`);
      continue;
    }
    itens.push({
      linha: indice + 1,
      nome: encontrado[1].replace(/\s+/g, " ").trim(),
      codigo: encontrado[2].trim(),
      tamanho: encontrado[3].trim().toUpperCase(),
      cor: encontrado[4].replace(/\s+/g, " ").trim().toUpperCase(),
      estoque,
      precoAtacado: moeda(campos[precoIndex] ?? ""),
    });
  }

  const porProduto = new Map<string, ProdutoImportado>();
  for (const item of itens) {
    const atual = porProduto.get(item.codigo);
    if (atual) atual.variacoes.push(item);
    else porProduto.set(item.codigo, { codigo: item.codigo, nome: item.nome, precoAtacado: item.precoAtacado, variacoes: [item], origem });
  }
  return { itens, produtos: Array.from(porProduto.values()), origem, erros };
}
