import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';
import { LoginRequest, RegisterRequest, AuthResponse } from '../interfaces/auth.interface';
import { firstValueFrom } from 'rxjs';

/**
 * Serviço responsável por gerenciar a autenticação no API Gateway
 * Faz a comunicação com o serviço de autenticação (auth-service)
 */
@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Realiza o login do usuário
   * @param loginData Dados de login do usuário
   */
  async login(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await firstValueFrom<AuthResponse>(
        this.authClient.send('auth.login', loginData)
      );

      // Armazena o token no cache para validações futuras
      await this.cacheManager.set(`token:${response.user.id}`, response.accessToken, 86400);

      return response;
    } catch (error) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
  }

  /**
   * Registra um novo usuário
   * @param registerData Dados de registro do usuário
   */
  async register(registerData: RegisterRequest): Promise<AuthResponse> {
    try {
      return await firstValueFrom<AuthResponse>(
        this.authClient.send('auth.register', registerData)
      );
    } catch (error) {
      throw new UnauthorizedException('Erro ao registrar usuário');
    }
  }

  /**
   * Valida um token JWT
   * @param token Token JWT a ser validado
   */
  async validateToken(token: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(token);
      const cachedToken = await this.cacheManager.get<string>(`token:${decoded.sub}`);

      if (!cachedToken || cachedToken !== token) {
        throw new UnauthorizedException('Token inválido ou expirado');
      }

      return decoded;
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  /**
   * Realiza o logout do usuário
   * @param userId ID do usuário
   */
  async logout(userId: string): Promise<void> {
    await this.cacheManager.del(`token:${userId}`);
  }
}