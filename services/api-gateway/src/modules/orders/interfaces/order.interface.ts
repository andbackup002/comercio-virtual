/**
 * Interface que representa um pedido no sistema
 */
export interface Order {
  id: string;                 // ID único do pedido
  user_id: string;            // ID do usuário que fez o pedido
  items: OrderItem[];         // Itens do pedido
  shipping_address: AddressInfo; // Endereço de entrega
  payment_info: PaymentInfo;  // Informações de pagamento
  status: string;             // Status atual do pedido
  subtotal: number;           // Subtotal dos itens
  shipping_cost: number;      // Custo do frete
  total: number;              // Valor total do pedido
  tracking_code?: string;     // Código de rastreamento
  shipping_company?: string;  // Transportadora
  created_at: string;        // Data de criação
  updated_at: string;        // Data da última atualização
}

/**
 * Interface que representa um item do pedido
 */
export interface OrderItem {
  product_id: string;         // ID do produto
  name: string;              // Nome do produto
  quantity: number;          // Quantidade
  unit_price: number;        // Preço unitário
  subtotal: number;          // Subtotal do item
}

/**
 * Interface para informações de endereço
 */
export interface AddressInfo {
  street: string;            // Nome da rua
  number: string;           // Número
  complement?: string;      // Complemento (opcional)
  neighborhood: string;     // Bairro
  city: string;            // Cidade
  state: string;           // Estado
  zip_code: string;        // CEP
  country: string;         // País
}

/**
 * Interface para informações de pagamento
 */
export interface PaymentInfo {
  payment_id: string;       // ID do pagamento
  status: string;          // Status do pagamento
  method: string;          // Método de pagamento
  last_four_digits?: string; // Últimos 4 dígitos do cartão
  amount: number;          // Valor do pagamento
  currency: string;        // Moeda (ex: BRL)
  paid_at?: string;        // Data do pagamento
}

/**
 * Interface para resposta de listagem de pedidos
 */
export interface ListOrdersResponse {
  orders: Order[];         // Lista de pedidos
  total: number;          // Total de pedidos encontrados
  page: number;           // Página atual
  total_pages: number;    // Total de páginas
}