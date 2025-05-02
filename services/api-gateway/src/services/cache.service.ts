import { Injectable, Inject, Optional } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as Redis from 'ioredis';

/**
 * Serviço genérico para gerenciamento de cache
 * Fornece métodos para armazenar e recuperar dados do Redis
 */
@Injectable()
export class CacheService {
  private redis: Redis.Redis | null = null;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    try {
      // Tenta obter o cliente Redis se disponível
      this.redis = (this.cacheManager as any).store.getClient?.();
    } catch (error) {
      // Ignora erro se não conseguir obter o cliente Redis
      console.warn('Redis client não disponível, algumas funcionalidades de cache podem ser limitadas');
    }
  }

  /**
   * Obtém um valor do cache
   * @param key Chave do cache
   * @param fetchData Função para buscar dados caso não estejam em cache
   * @param ttl Tempo de vida do cache em segundos
   */
  async getOrSet<T>(
    key: string,
    fetchData: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T> {
    const cachedData = await this.cacheManager.get<T>(key);
    
    if (cachedData) {
      return cachedData;
    }

    const data = await fetchData();
    await this.cacheManager.set(key, data, ttl);
    
    return data;
  }

  /**
   * Remove um valor do cache
   * @param key Chave do cache
   */
  async invalidate(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  /**
   * Remove múltiplos valores do cache usando um padrão
   * @param pattern Padrão para matching das chaves (ex: user:*)
   */
  async invalidatePattern(pattern: string): Promise<void> {
    if (this.redis) {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    }
  }

  /**
   * Armazena um valor no cache
   * @param key Chave do cache
   * @param value Valor a ser armazenado
   * @param ttl Tempo de vida em segundos
   */
  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  /**
   * Obtém um valor do cache
   * @param key Chave do cache
   */
  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }
}