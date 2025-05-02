import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { RedisStore } from 'cache-manager-redis-store';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { RateLimitMiddleware } from './middlewares/rate-limit.middleware';
import { CacheService } from './services/cache.service';

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
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const store = await RedisStore.create({
          socket: {
            host: configService.get('REDIS_HOST', 'localhost'),
            port: configService.get('REDIS_PORT', 6379),
          },
          ttl: 3600,
        });
        return {
          store: () => store,
        };
      },
      inject: [ConfigService],
    }),

    // Rate limiting global
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        ttl: config.get('THROTTLE_TTL', 60),
        limit: config.get('THROTTLE_LIMIT', 100),
      }),
    }),

    // Módulos da aplicação
    AuthModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    NotificationsModule,
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