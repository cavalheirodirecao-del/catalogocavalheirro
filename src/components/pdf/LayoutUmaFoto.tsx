// Layout UmaFoto — foto full-width 2/3 da página + info na parte inferior
// 1 produto por página, foto de borda a borda

import React from "react";
import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { ProdutoPDF, TabelaPreco, getPrecos, formatMoeda, getFotoProduto, getVariantesDisponiveis } from "./types";

// A4: 841.89pt altura. Cabeçalho ~42pt. Rodapé reserva ~22pt.
// Disponível para conteúdo: ~778pt
// Foto: 66% = ~513pt | Info: 34% = ~265pt
const FOTO_HEIGHT = 510;
const INFO_PADDING_H = 28;

const styles = StyleSheet.create({
  card: {
    width: "100%",
    flexDirection: "column",
  },

  // Foto — full width, edge-to-edge
  foto: {
    width: "100%",
    height: FOTO_HEIGHT,
    objectFit: "cover",
    backgroundColor: "#F3F4F6",
  },
  fotoPlaceholder: {
    width: "100%",
    height: FOTO_HEIGHT,
    backgroundColor: "#EFEFEF",
  },

  // Seção de informações
  info: {
    paddingHorizontal: INFO_PADDING_H,
    paddingTop: 18,
    paddingBottom: 30,
    backgroundColor: "#FFFFFF",
  },

  // Cabeçalho: código + nome
  codigo: {
    fontSize: 8,
    fontFamily: "Helvetica",
    color: "#9CA3AF",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  nome: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginBottom: 14,
  },

  // Grid de cores
  coresGrid: {
    flexDirection: "column",
    gap: 6,
    marginBottom: 16,
  },
  corRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
  },
  bolinha: {
    width: 10,
    height: 10,
    borderRadius: 5,
    border: "0.5pt solid #E5E7EB",
    marginRight: 5,
  },
  corNome: {
    fontSize: 8.5,
    color: "#374151",
    minWidth: 48,
    marginRight: 6,
  },
  tamanho: {
    fontSize: 7.5,
    color: "#6B7280",
    borderWidth: 0.5,
    borderColor: "#D1D5DB",
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginRight: 3,
  },

  // Divisor
  divisor: {
    height: 0.5,
    backgroundColor: "#E5E7EB",
    marginBottom: 12,
  },

  // Preços
  precoBox: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
  },
  precoVista: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  precoPrazo: {
    fontSize: 9,
    color: "#6B7280",
  },
});

interface Props {
  produto: ProdutoPDF;
  tabela: TabelaPreco;
}

export function CardUmaFoto({ produto, tabela }: Props) {
  const foto = getFotoProduto(produto);
  const precos = getPrecos(produto, tabela);

  return (
    <View style={styles.card}>
      {/* Foto full-width */}
      {foto
        ? <Image src={foto} style={styles.foto as any} />
        : <View style={styles.fotoPlaceholder} />
      }

      {/* Informações */}
      <View style={styles.info}>
        <Text style={styles.codigo}>{produto.codigo}</Text>
        <Text style={styles.nome}>{produto.nome}</Text>

        <View style={styles.coresGrid}>
          {produto.cores.map(cor => {
            const variantes = getVariantesDisponiveis(cor);
            if (variantes.length === 0) return null;
            return (
              <View key={cor.id} style={styles.corRow}>
                <View style={[styles.bolinha, { backgroundColor: cor.hexCor ?? "#CCCCCC" }]} />
                <Text style={styles.corNome}>{cor.nome}</Text>
                {variantes.map(v => (
                  <Text key={v.id} style={styles.tamanho}>{v.gradeItem.valor}</Text>
                ))}
              </View>
            );
          })}
        </View>

        {precos && (
          <>
            <View style={styles.divisor} />
            <View style={styles.precoBox}>
              <Text style={styles.precoVista}>{formatMoeda(precos.vista)}</Text>
              {precos.prazo !== precos.vista && (
                <Text style={styles.precoPrazo}>{formatMoeda(precos.prazo)} a prazo</Text>
              )}
            </View>
          </>
        )}
      </View>
    </View>
  );
}
