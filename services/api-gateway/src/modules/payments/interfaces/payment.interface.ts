/**
 * Interface que representa um pagamento no sistema
 */
export interface Payment {
  id: string;                // ID único do pagamento
  order_id: string;          // ID do pedido relacionado
  user_id: string;           // ID do usuário que realizou o pagamento
  amount: number;            // Valor do pagamento
  currency: string;          // Moeda utilizada (ex: BRL)
  status: string;           // Status do pagamento
  payment_method: PaymentMethod; // Método de pagamento utilizado
  gateway_response: string;  // Resposta do gateway de pagamento
  created_at: string;       // Data de criação
  updated_at: string;       // Data da última atualização
}

/**
 * Interface que representa um método de pagamento
 */
export interface PaymentMethod {
  type: string;             // Tipo de pagamento (credit_card, pix, boleto)
  card_brand?: string;      // Bandeira do cartão
  last_four_digits?: string; // Últimos 4 dígitos do cartão
  holder_name?: string;     // Nome do titular do cartão
  expiry_month?: string;    // Mês de expiração do cartão
  expiry_year?: string;     // Ano de expiração do cartão
  boleto_url?: string;      // URL do boleto para pagamento
  pix_qr_code?: string;     // QR Code para pagamento PIX
  pix_copy_paste?: string;  // Código PIX copia e cola
}

/**
 * Interface para resposta de listagem de pagamentos
 */
export interface ListPaymentsResponse {
  payments: Payment[];      // Lista de pagamentos
  total: number;           // Total de pagamentos encontrados
  page: number;            // Página atual
  total_pages: number;     // Total de páginas
}