import { Injectable, Inject, OnModuleInit, NotFoundException } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';
import { Product, ProductFilters, PaginatedProducts } from '../interfaces/product.interface';
import { ProductServiceGrpc } from '../interfaces/product-grpc.interface';
import { CacheService } from '../../../services/cache.service';

@Injectable()
export class ProductsService implements OnModuleInit {
  private productService: ProductServiceGrpc = {} as ProductServiceGrpc;

  constructor(
    @Inject('PRODUCT_PACKAGE') private readonly client: ClientGrpc,
    private readonly cacheService: CacheService,
  ) {}

  onModuleInit() {
    this.productService = this.client.getService<ProductServiceGrpc>('ProductService');
  }

  private getCacheKey(productId: string): string {
    return `product:${productId}`;
  }

  async listProducts(params: ProductFilters & { page: number; limit: number }): Promise<PaginatedProducts> {
    const cacheKey = `products:list:${JSON.stringify(params)}`;
    return this.cacheService.getOrSet(
      cacheKey,
      () => firstValueFrom(this.productService.listProducts(params)),
      3600
    );
  }

  async searchProducts(query: string, params: ProductFilters & { page: number; limit: number }): Promise<PaginatedProducts> {
    const cacheKey = `products:search:${query}:${JSON.stringify(params)}`;
    return this.cacheService.getOrSet(
      cacheKey,
      () => firstValueFrom(this.productService.searchProducts({ query, ...params })),
      3600
    );
  }

  async getProduct(id: string): Promise<Product> {
    return this.cacheService.getOrSet(
      this.getCacheKey(id),
      async () => {
        const product = await firstValueFrom(this.productService.getProduct({ id }));
        if (!product?.id) {
          throw new NotFoundException(`Produto ${id} não encontrado`);
        }
        return product;
      },
      3600
    );
  }

  async createProduct(data: CreateProductDto): Promise<Product> {
    const product = await firstValueFrom(this.productService.createProduct(data));
    await this.cacheService.invalidatePattern('products:list:*');
    await this.cacheService.invalidatePattern('products:search:*');
    return product;
  }

  async updateProduct(data: { id: string } & UpdateProductDto): Promise<Product | null> {
    const product = await firstValueFrom(this.productService.updateProduct(data));
    if (product?.id) {
      await this.cacheService.invalidate(this.getCacheKey(data.id));
      await this.cacheService.invalidatePattern('products:list:*');
      await this.cacheService.invalidatePattern('products:search:*');
      return product;
    }
    return null;
  }

  async updateStock(
    id: string,
    operation: 'add' | 'subtract' | 'set',
    quantity: number,
    reason?: string
  ): Promise<Product> {
    const product = await firstValueFrom(
      this.productService.updateStock({
        id,
        operation,
        quantity,
        reason,
      })
    );
    await this.cacheService.invalidate(this.getCacheKey(id));
    return product;
  }

  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    const result = await firstValueFrom(this.productService.deleteProduct({ id }));
    if (!result?.success) {
      throw new NotFoundException(`Produto ${id} não encontrado`);
    }
    await this.cacheService.invalidate(this.getCacheKey(id));
    await this.cacheService.invalidatePattern('products:list:*');
    await this.cacheService.invalidatePattern('products:search:*');
    return result;
  }
}