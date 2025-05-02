import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { AuthModule } from '../auth/auth.module';
import { CartController } from './controllers/cart.controller';
import { CartService } from './services/cart.service';

@Module({
  imports: [
    AuthModule,
    
    // Cliente gRPC para comunicação com o serviço de carrinho
    ClientsModule.registerAsync([
      {
        name: 'CART_PACKAGE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.get('CART_SERVICE_URL', 'localhost:50055'),
            package: 'cart',
            protoPath: 'services/cart-service/proto/cart.proto',
            loader: {
              keepCase: true,
              longs: String,
              enums: String,
              defaults: true,
              oneofs: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),

    // Cache Redis
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
        ttl: 1800, // 30 minutos
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}