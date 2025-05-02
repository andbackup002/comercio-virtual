import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CacheService } from '../../../services/cache.service';
import { CartServiceGrpc } from '../interfaces/cart-grpc.interface';
import { AddItemDto, UpdateItemDto, ApplyDiscountDto, UpdateCartStatusDto } from '../dto/cart.dto';

@Injectable()
export class CartService {
  private cartServiceGrpc: CartServiceGrpc = {} as CartServiceGrpc;
  private readonly cacheTTL = 1800; // 30 minutos

  constructor(
    @Inject('CART_PACKAGE') private readonly client: ClientGrpc,
    private readonly cacheService: CacheService,
  ) {}

  onModuleInit() {
    this.cartServiceGrpc = this.client.getService<CartServiceGrpc>('CartService');
  }

  private getCacheKey(cartId: string): string {
    return `cart:${cartId}`;
  }

  async createCart(sessionId: string, userId?: string, metadata?: Record<string, string>) {
    const cart = await firstValueFrom(
      this.cartServiceGrpc.createCart({
        sessionId,
        userId,
        metadata: metadata || {},
      })
    );

    if (cart?.id) {
      await this.cacheService.set(this.getCacheKey(cart.id), cart, this.cacheTTL);
    }

    return cart;
  }

  async getCart(id: string) {
    return this.cacheService.getOrSet(
      this.getCacheKey(id),
      async () => {
        const cart = await firstValueFrom(
          this.cartServiceGrpc.getCart({ id })
        );

        if (!cart?.id) {
          throw new NotFoundException(`Carrinho ${id} não encontrado`);
        }

        return cart;
      },
      this.cacheTTL
    );
  }

  async addItem(cartId: string, item: AddItemDto) {
    const cart = await firstValueFrom(
      this.cartServiceGrpc.addItem({
        cartId,
        productId: item.productId,
        quantity: item.quantity,
        attributes: item.attributes || {},
      })
    );

    if (cart?.id) {
      await this.cacheService.set(this.getCacheKey(cartId), cart, this.cacheTTL);
    }

    return cart;
  }

  async updateItem(cartId: string, productId: string, update: UpdateItemDto) {
    const cart = await firstValueFrom(
      this.cartServiceGrpc.updateItem({
        cartId,
        productId,
        quantity: update.quantity,
        attributes: update.attributes || {},
      })
    );

    if (cart?.id) {
      await this.cacheService.set(this.getCacheKey(cartId), cart, this.cacheTTL);
    }

    return cart;
  }

  async removeItem(cartId: string, productId: string) {
    const cart = await firstValueFrom(
      this.cartServiceGrpc.removeItem({
        cartId,
        productId,
      })
    );

    if (cart?.id) {
      await this.cacheService.set(this.getCacheKey(cartId), cart, this.cacheTTL);
    }

    return cart;
  }

  async applyDiscount(cartId: string, discount: ApplyDiscountDto) {
    const cart = await firstValueFrom(
      this.cartServiceGrpc.applyDiscount({
        cartId,
        code: discount.code,
      })
    );

    if (cart?.id) {
      await this.cacheService.set(this.getCacheKey(cartId), cart, this.cacheTTL);
    }

    return cart;
  }

  async updateStatus(cartId: string, update: UpdateCartStatusDto) {
    const cart = await firstValueFrom(
      this.cartServiceGrpc.updateCartStatus({
        cartId,
        status: update.status,
      })
    );

    if (cart?.id) {
      await this.cacheService.set(this.getCacheKey(cartId), cart, this.cacheTTL);
    }

    return cart;
  }

  async deleteCart(id: string) {
    const response = await firstValueFrom(
      this.cartServiceGrpc.deleteCart({ id })
    );

    if (response?.success) {
      await this.cacheService.invalidate(this.getCacheKey(id));
    }

    return response;
  }
}