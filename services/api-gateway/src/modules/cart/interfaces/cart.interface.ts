/**
 * Interface que representa um item no carrinho
 */
export interface CartItem {
  productId: string;            // ID do produto
  sku: string;                 // Código único do produto
  name: string;                // Nome do produto
  price: number;               // Preço unitário
  quantity: number;            // Quantidade
  attributes?: Record<string, any>; // Atributos personalizados (cor, tamanho, etc)
  imageUrl?: string;           // URL da imagem do produto
}

/**
 * Enumeração dos status possíveis do carrinho
 */
export enum CartStatus {
  ACTIVE = 'active',           // Carrinho ativo
  CHECKOUT = 'checkout',       // Em processo de checkout
  ABANDONED = 'abandoned',     // Abandonado
  COMPLETED = 'completed',     // Compra finalizada
  EXPIRED = 'expired'         // Expirado
}

/**
 * Interface para descontos aplicados ao carrinho
 */
export interface CartDiscount {
  code: string;               // Código do cupom
  amount: number;             // Valor do desconto
  type: 'percentage' | 'fixed'; // Tipo do desconto (porcentagem ou valor fixo)
}

/**
 * Interface que representa um carrinho de compras
 */
export interface Cart {
  id: string;                 // ID único do carrinho
  userId?: string;            // ID do usuário (opcional para carrinhos anônimos)
  sessionId: string;          // ID da sessão
  items: CartItem[];          // Itens no carrinho
  status: CartStatus;         // Status atual do carrinho
  subtotal: number;           // Subtotal (sem descontos)
  total: number;              // Total (com descontos aplicados)
  discounts?: CartDiscount[]; // Descontos aplicados
  metadata?: { [key: string]: any }; // Metadados adicionais
  createdAt: Date;           // Data de criação
  updatedAt: Date;           // Data da última atualização
  expiresAt?: Date;          // Data de expiração
}

/**
 * Interface para as configurações do carrinho
 */
export interface CartConfig {
  maxItemQuantity: number;    // Quantidade máxima por item
  minItemQuantity: number;    // Quantidade mínima por item
  expireInMinutes: number;    // Tempo até a expiração em minutos
  allowAnonymous: boolean;    // Permite carrinhos anônimos
  requireStock: boolean;      // Requer validação de estoque
}