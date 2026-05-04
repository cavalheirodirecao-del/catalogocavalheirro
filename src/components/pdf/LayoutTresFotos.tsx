// Layout 2 — Três Fotos + Preço (1 produto por página)
// Foto grande à esquerda + 2 menores empilhadas à direita + info embaixo

import React from "react";
import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { ProdutoPDF, TabelaPreco, getPrecos, formatMoeda, getFotosCor, getVariantesDisponiveis } from "./types";

const styles = StyleSheet.create({
  card: {
    marginBottom: 24,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  fotosRow: {
    flexDirection: "row",
    height: 320,
  },
  fotoGrande: {
    width: "66%",
    height: "100%",
    objectFit: "cover",
    backgroundColor: "#F3F4F6",
  },
  fotosLaterais: {
    width: "34%",
    flexDirection: "column",
    borderLeftWidth: 0.5,
    borderLeftColor: "#E5E7EB",
  },
  fotoPequena: {
    flex: 1,
    objectFit: "cover",
    backgroundColor: "#F3F4F6",
  },
  fotoPequenaSep: {
    flex: 1,
    objectFit: "cover",
    backgroundColor: "#F3F4F6",
    borderTopWidth: 0.5,
    borderTopColor: "#E5E7EB",
  },
  fotoPlaceholder: {
    backgroundColor: "#F3F4F6",
  },
  info: {
    padding: 10,
    borderTopWidth: 0.5,
    borderTopColor: "#E5E7EB",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  nome: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    flex: 1,
  },
  codigo: {
    fontSize: 8,
    fontFamily: "Helvetica",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    paddingTop: 1,
  },
  coresRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 6,
    gap: 4,
  },
  corItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  bolinha: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    marginRight: 3,
    border: "0.5pt solid #E5E7EB",
  },
  corNome: {
    fontSize: 7.5,
    color: "#374151",
  },
  gradeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 3,
    marginTop: 2,
    marginBottom: 4,
  },
  tamanho: {
    fontSize: 7,
    color: "#6B7280",
    borderWidth: 0.5,
    borderColor: "#D1D5DB",
    paddingHorizontal: 3,
    paddingVertical: 1.5,
  },
  precoRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: "#F3F4F6",
  },
  precoLabel: {
    fontSize: 7.5,
    color: "#6B7280",
    marginBottom: 1,
  },
  precoValor: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  precoValorPrazo: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#374151",
  },
});

interface Props {
  produto: ProdutoPDF;
  tabela: TabelaPreco;
}

export function CardTresFotos({ produto, tabela }: Props) {
  // Coleta todas as fotos do produto (usando a 1ª cor como fonte principal)
  const todasFotos: string[] = [];
  for (const cor of produto.cores) {
    const fotos = getFotosCor(cor, produto);
    for (const f of fotos) {
      if (!todasFotos.includes(f)) todasFotos.push(f);
      if (todasFotos.length >= 3) break;
    }
    if (todasFotos.length >= 3) break;
  }
  if (produto.imagemPrincipal && !todasFotos.includes(produto.imagemPrincipal)) {
    todasFotos.unshift(produto.imagemPrincipal);
  }

  const foto1 = todasFotos[0] ?? null;
  const foto2 = todasFotos[1] ?? todasFotos[0] ?? null;
  const foto3 = todasFotos[2] ?? todasFotos[0] ?? null;

  const precos = getPrecos(produto, tabela);

  // Agrega todos os tamanhos disponíveis (de todas as cores)
  const todosGradeItens = new Map<string, { valor: string; ordem: number }>();
  for (const cor of produto.cores) {
    for (const v of getVariantesDisponiveis(cor)) {
      todosGradeItens.set(v.gradeItem.id, v.gradeItem);
    }
  }
  const tamanhos = Array.from(todosGradeItens.values()).sort((a, b) => a.ordem - b.ordem);

  return (
    <View style={styles.card}>
      {/* Área de fotos */}
      <View style={styles.fotosRow}>
        {foto1
          ? <Image src={foto1} style={styles.fotoGrande as any} />
          : <View style={[styles.fotoGrande as any, styles.fotoPlaceholder]} />
        }
        <View style={styles.fotosLaterais}>
          {foto2
            ? <Image src={foto2} style={styles.fotoPequena as any} />
            : <View style={[styles.fotoPequena as any, styles.fotoPlaceholder]} />
          }
          {foto3
            ? <Image src={foto3} style={styles.fotoPequenaSep as any} />
            : <View style={[styles.fotoPequenaSep as any, styles.fotoPlaceholder]} />
          }
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.headerRow}>
          <Text style={styles.nome}>{produto.nome}</Text>
          <Text style={styles.codigo}>{produto.codigo}</Text>
        </View>

        {/* Cores */}
        <View style={styles.coresRow}>
          {produto.cores.map(cor => (
            <View key={cor.id} style={styles.corItem}>
              <View style={[styles.bolinha, { backgroundColor: cor.hexCor ?? "#CCCCCC" }]} />
              <Text style={styles.corNome}>{cor.nome}</Text>
            </View>
          ))}
        </View>

        {/* Tamanhos disponíveis */}
        {tamanhos.length > 0 && (
          <View style={styles.gradeRow}>
            {tamanhos.map(g => (
              <Text key={g.valor} style={styles.tamanho}>{g.valor}</Text>
            ))}
          </View>
        )}

        {/* Preços */}
        {precos && (
          <View style={styles.precoRow}>
            <View>
              <Text style={styles.precoLabel}>À vista</Text>
              <Text style={styles.precoValor}>{formatMoeda(precos.vista)}</Text>
            </View>
            {precos.prazo !== precos.vista && (
              <View>
                <Text style={styles.precoLabel}>A prazo</Text>
                <Text style={styles.precoValorPrazo}>{formatMoeda(precos.prazo)}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
