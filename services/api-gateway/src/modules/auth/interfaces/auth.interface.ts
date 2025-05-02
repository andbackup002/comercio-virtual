/**
 * Interface para requisição de login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Interface para requisição de registro
 */
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

/**
 * Interface para resposta de autenticação
 */
export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}