import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

/**
 * Middleware para controle de taxa de requisições (rate limiting)
 * Utiliza Redis para armazenar os contadores de requisições
 */
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Aplica o rate limiting baseado no IP do cliente
   * @param req Request do Express
   * @param res Response do Express
   * @param next Função next do Express
   */
  async use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip;
    const path = req.path;
    const key = `ratelimit:${ip}:${path}`;

    // Configurações diferentes por rota
    const limit = this.getRouteLimit(path);
    const window = this.getRouteWindow(path);

    try {
      const current = await this.cacheManager.get<number>(key) || 0;

      if (current >= limit) {
        throw new HttpException('Muitas requisições, tente novamente mais tarde', HttpStatus.TOO_MANY_REQUESTS);
      }

      await this.cacheManager.set(key, current + 1, window);
      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', limit - (current + 1));

      next();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      next(error);
    }
  }

  /**
   * Retorna o limite de requisições para uma rota específica
   * @param path Caminho da rota
   */
  private getRouteLimit(path: string): number {
    // Configurações específicas por rota
    const routeLimits = {
      '/auth/login': 5,        // 5 tentativas de login
      '/auth/register': 3,     // 3 registros por janela
      '/products': 1000,       // 1000 requisições para produtos
      '/orders': 100,          // 100 requisições para pedidos
      default: 500,            // limite padrão
    };

    return Object.entries(routeLimits).find(
      ([route]) => path.startsWith(route)
    )?.[1] || routeLimits.default;
  }

  /**
   * Retorna a janela de tempo (em segundos) para uma rota específica
   * @param path Caminho da rota
   */
  private getRouteWindow(path: string): number {
    // Configurações específicas por rota (em segundos)
    const routeWindows = {
      '/auth/login': 300,      // 5 minutos
      '/auth/register': 3600,  // 1 hora
      '/products': 3600,       // 1 hora
      '/orders': 3600,         // 1 hora
      default: 3600,           // 1 hora (padrão)
    };

    return Object.entries(routeWindows).find(
      ([route]) => path.startsWith(route)
    )?.[1] || routeWindows.default;
  }
}