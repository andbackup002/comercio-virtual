import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { RateLimitMiddleware } from './middlewares/rate-limit.middleware';
import { CacheService } from './services/cache.service';
import { AuthModule } from './modules/auth/auth.module';
import { RedisClientOptions } from 'redis';

/**
 * Módulo principal do API Gateway
 * Configura middlewares globais e integra todos os módulos do sistema
 */
@Module({
  imports: [
    // Configuração global
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Cache Redis global
    CacheModule.register<RedisClientOptions>({
      isGlobal: true,
      store: 'redis',
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
      ttl: 3600,
    }),

    // Rate limiting global
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        throttlers: [{
          ttl: config.get('THROTTLE_TTL', 60),
          limit: config.get('THROTTLE_LIMIT', 100),
        }],
      }),
    }),

    // Apenas módulo de autenticação ativo
    AuthModule,
    /* Módulos temporariamente desabilitados
    ProductsModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    NotificationsModule,
    */
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Aplica o middleware de rate limit em todas as rotas
    consumer.apply(RateLimitMiddleware).forRoutes('*');
  }
}