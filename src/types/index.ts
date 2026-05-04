import { TipoCatalogo, PerfilUsuario, StatusPedido, TipoPagamento } from "@prisma/client";

export type { TipoCatalogo, PerfilUsuario, StatusPedido, TipoPagamento };

export interface UsuarioSession {
  id: string;
  name: string;
  email: string;
  perfil: PerfilUsuario;
  vendedorSlug: string | null;
}

export interface ProdutoComVariantes {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  precoVarejoVista: number;
  precoVarejoPrazo: number;
  precoAtacadoVista: number;
  precoAtacadoPrazo: number;
  precoFabricaVista: number;
  precoFabricaPrazo: number;
  qtdMinimaAtacado: number;
  qtdMinimaFabrica: number;
  cores: {
    id: string;
    nome: string;
    hexCor: string | null;
    imagens: { url: string; principal: boolean }[];
    variantes: {
      id: string;
      gradeItem: { valor: string; ordem: number };
      estoque: { quantidade: number } | null;
    }[];
  }[];
}

export interface ItemCarrinho {
  varianteId: string;
  produtoId: string;
  produtoNome: string;
  corNome: string;
  tamanho: string;
  imagemUrl: string;
  quantidade: number;
  precoUnitario: number;
}
