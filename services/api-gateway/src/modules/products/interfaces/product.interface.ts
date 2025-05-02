/**
 * Interface que representa as dimensões de um produto
 */
export interface Dimensions {
  length: number;  // Comprimento em centímetros
  width: number;   // Largura em centímetros
  height: number;  // Altura em centímetros
}

/**
 * Interface para informações de SEO do produto
 */
export interface SEO {
  title: string;       // Título otimizado para SEO
  description: string; // Descrição otimizada para SEO
  keywords: string;    // Palavras-chave para SEO
  slug: string;        // URL amigável do produto
}

/**
 * Interface que representa um produto no sistema
 */
export interface Product {
  id: string;
  sku: string;                    // Código único do produto
  name: string;                   // Nome do produto
  description: string;            // Descrição completa
  shortDescription: string;       // Descrição curta/resumida
  price: number;                  // Preço atual
  compareAtPrice?: number;        // Preço anterior (para promoções)
  cost?: number;                  // Custo do produto
  stock: number;                  // Quantidade em estoque
  minStock: number;               // Estoque mínimo
  maxStock: number;               // Estoque máximo
  reservedStock: number;          // Quantidade reservada
  category: string;               // Categoria principal
  subcategory?: string;           // Subcategoria
  brand?: string;                 // Marca
  tags: string[];                 // Tags para categorização
  images: string[];               // URLs das imagens
  weight?: number;                // Peso em gramas
  dimensions?: Dimensions;        // Dimensões do produto
  attributes: Record<string, string>; // Atributos personalizados
  status: 'active' | 'inactive' | 'draft'; // Status do produto
  active: boolean;                // Indica se está ativo para venda
  featured: boolean;              // Indica se é destaque
  rating: number;                 // Avaliação média
  reviewCount: number;            // Quantidade de avaliações
  seo: SEO;                       // Informações de SEO
  createdAt: string;              // Data de criação
  updatedAt: string;              // Data da última atualização
  deletedAt?: string;             // Data de exclusão (soft delete)
}

/**
 * Interface para filtros de busca de produtos
 */
export interface ProductFilters {
  category?: string;          // Filtrar por categoria
  subcategory?: string;       // Filtrar por subcategoria
  brand?: string;             // Filtrar por marca
  minPrice?: number;          // Preço mínimo
  maxPrice?: number;          // Preço máximo
  status?: string;            // Filtrar por status
  featured?: boolean;         // Apenas produtos em destaque
  tags?: string[];            // Filtrar por tags
}

/**
 * Interface para resultado paginado de produtos
 */
export interface PaginatedProducts {
  products: Product[];        // Lista de produtos
  total: number;              // Total de produtos encontrados
  page: number;               // Página atual
  totalPages: number;         // Total de páginas
}