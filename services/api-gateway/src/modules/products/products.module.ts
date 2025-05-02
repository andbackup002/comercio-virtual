import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { ProductsController } from './controllers/products.controller';
import { ProductsService } from './services/products.service';
import { CacheService } from '../../services/cache.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'PRODUCT_CATALOG_PACKAGE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.get('PRODUCT_CATALOG_URL', 'localhost:50051'),
            package: 'product',
            protoPath: join(__dirname, '../../../../product-catalog/proto/product.proto'),
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
  ],
  controllers: [ProductsController],
  providers: [ProductsService, CacheService],
  exports: [ProductsService],
})
export class ProductsModule {}