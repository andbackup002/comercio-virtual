/**
 * Interface que representa uma notificação no sistema
 */
export interface Notification {
  id: string;                 // ID único da notificação
  recipient: string;          // Destinatário da notificação
  type: 'email' | 'push' | 'websocket'; // Tipo de notificação
  content: string;           // Conteúdo da notificação
  status: string;            // Status da notificação
  template?: string;         // Template a ser utilizado
  templateData?: Record<string, any>; // Dados para o template
  createdAt: string;        // Data de criação
  updatedAt: string;        // Data da última atualização
}

/**
 * Interface para requisição de envio de notificação
 */
export interface NotificationRequest {
  recipient: string;         // Destinatário
  type: 'email' | 'push' | 'websocket'; // Tipo de notificação
  content: string;          // Conteúdo
  template?: string;        // Template opcional
  templateData?: Record<string, any>; // Dados para o template
}

/**
 * Interface para resposta de listagem de notificações
 */
export interface ListNotificationsResponse {
  notifications: Notification[]; // Lista de notificações
  total: number;               // Total de notificações encontradas
  page: number;                // Página atual
  totalPages: number;          // Total de páginas
}

/**
 * Interface para notificação com informações detalhadas
 */
export interface INotification {
  id: string;                 // ID único da notificação
  type: 'email' | 'push' | 'websocket'; // Tipo de notificação
  recipient: string;          // Destinatário
  subject?: string;          // Assunto (para emails)
  content?: string;          // Conteúdo principal
  title?: string;            // Título da notificação
  body?: string;             // Corpo da mensagem
  template?: string;         // Template a ser utilizado
  templateData?: Record<string, any>; // Dados para o template
  metadata?: Record<string, any>;    // Metadados adicionais
  status: 'pending' | 'sent' | 'failed'; // Status do processamento
  createdAt: Date;          // Data de criação
  updatedAt: Date;          // Data da última atualização
}

/**
 * Interface para o serviço de notificações
 */
export interface INotificationService {
  /**
   * Envia uma nova notificação
   * @param notification Dados da notificação a ser enviada
   */
  send(notification: Omit<INotification, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<INotification>;
  
  /**
   * Busca uma notificação pelo ID
   * @param id ID da notificação
   */
  get(id: string): Promise<INotification>;
  
  /**
   * Lista notificações com filtros
   * @param params Parâmetros de filtragem e paginação
   */
  list(params: {
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: INotification[]; total: number }>;
}