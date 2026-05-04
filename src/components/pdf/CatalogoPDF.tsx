// Documento PDF raiz — capa + páginas de produtos
// Usado server-side via renderToBuffer no API route

import React from "react";
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { ProdutoPDF, TabelaPreco, LayoutPDF } from "./types";
import { CardUmaFoto } from "./LayoutUmaFoto";
import { CardTresFotos } from "./LayoutTresFotos";

const LABEL_TABELA: Record<TabelaPreco, string> = {
  VAREJO: "Varejo",
  ATACADO: "Atacado",
  FABRICA: "Fábrica",
  SEM_PRECO: "",
};

const styles = StyleSheet.create({
  // Capa
  capaPagina: {
    width: "100%",
    height: "100%",
    backgroundColor: "#111827",
  },
  capaImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  capaFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
  },
  capaMarca: {
    fontSize: 36,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    letterSpacing: 4,
  },
  capaSubtitulo: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 8,
    letterSpacing: 2,
  },
  // Páginas de produto
  pagina: {
    paddingVertical: 0,
    backgroundColor: "#FFFFFF",
  },
  // Cabeçalho de página
  cabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
    marginBottom: 0,
  },
  cabMarca: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    letterSpacing: 2,
  },
  cabTabela: {
    fontSize: 8,
    color: "#6B7280",
    letterSpacing: 1,
  },
  // Rodapé
  rodape: {
    position: "absolute",
    bottom: 10,
    left: 24,
    right: 24,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rodapeTexto: {
    fontSize: 7,
    color: "#D1D5DB",
  },
  // Grid UmaFoto — wrapper sem padding (foto vai edge-to-edge)
  gridUmaFoto: {
    flexDirection: "column",
    flex: 1,
  },
  // Separador de grupo/subgrupo
  grupoHeader: {
    backgroundColor: "#111827",
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  grupoNome: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  subGrupoNome: {
    fontSize: 9,
    color: "#9CA3AF",
    letterSpacing: 1,
    marginTop: 2,
  },
});

interface Props {
  produtos: ProdutoPDF[];
  capaUrl: string | null;
  tabelaPreco: TabelaPreco;
  layout: LayoutPDF;
  grupoNome?: string;
  subGrupoNome?: string;
}

export function CatalogoPDF({ produtos, capaUrl, tabelaPreco, layout, grupoNome, subGrupoNome }: Props) {
  const labelTabela = LABEL_TABELA[tabelaPreco];

  const produtosPorPagina = 1;

  const paginas: ProdutoPDF[][] = [];
  for (let i = 0; i < produtos.length; i += produtosPorPagina) {
    paginas.push(produtos.slice(i, i + produtosPorPagina));
  }

  return (
    <Document title="Catálogo Cavalheiro" author="Cavalheiro">
      {/* Capa */}
      <Page size="A4" style={styles.capaPagina}>
        {capaUrl ? (
          <Image src={capaUrl} style={styles.capaImg as any} />
        ) : (
          <View style={styles.capaFallback}>
            <Text style={styles.capaMarca}>CAVALHEIRO</Text>
            {(grupoNome || subGrupoNome) && (
              <Text style={styles.capaSubtitulo}>
                {[grupoNome, subGrupoNome].filter(Boolean).join(" · ").toUpperCase()}
              </Text>
            )}
            {labelTabela && (
              <Text style={styles.capaSubtitulo}>TABELA {labelTabela.toUpperCase()}</Text>
            )}
          </View>
        )}
      </Page>

      {/* Página de título do grupo/subgrupo (se filtrado) */}
      {(grupoNome || subGrupoNome) && (
        <Page size="A4" style={styles.pagina}>
          <View style={styles.grupoHeader}>
            {grupoNome && <Text style={styles.grupoNome}>{grupoNome}</Text>}
            {subGrupoNome && <Text style={styles.subGrupoNome}>{subGrupoNome}</Text>}
          </View>
        </Page>
      )}

      {/* Páginas de produtos */}
      {paginas.map((grupo, pageIdx) => (
        <Page key={pageIdx} size="A4" style={styles.pagina}>
          {/* Cabeçalho */}
          <View style={styles.cabecalho} fixed>
            <Text style={styles.cabMarca}>CAVALHEIRO</Text>
            {labelTabela ? (
              <Text style={styles.cabTabela}>TABELA {labelTabela.toUpperCase()}</Text>
            ) : null}
          </View>

          {/* Produtos */}
          {layout === "UMA_FOTO" ? (
            <View style={styles.gridUmaFoto}>
              {grupo.map(produto => (
                <CardUmaFoto key={produto.id} produto={produto} tabela={tabelaPreco} />
              ))}
            </View>
          ) : (
            <View>
              {grupo.map(produto => (
                <CardTresFotos key={produto.id} produto={produto} tabela={tabelaPreco} />
              ))}
            </View>
          )}

          {/* Rodapé */}
          <View style={styles.rodape} fixed>
            <Text style={styles.rodapeTexto}>cavalheiro.com.br</Text>
            <Text style={styles.rodapeTexto} render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            } />
          </View>
        </Page>
      ))}
    </Document>
  );
}
