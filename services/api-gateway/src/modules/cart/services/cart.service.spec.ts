import { Test, TestingModule } from '@nestjs/testing';
import { ClientGrpc } from '@nestjs/microservices';
import { NotFoundException } from '@nestjs/common';
import { of } from 'rxjs';
import { CartService } from './cart.service';
import { CacheService } from '../../../services/cache.service';
import { CartServiceGrpc } from '../interfaces/cart-grpc.interface';
import { Cart, CartStatus } from '../interfaces/cart.interface';
import { AddItemDto, UpdateItemDto } from '../dto/cart.dto';

describe('CartService', () => {
  let service: CartService;
  let client: jest.Mocked<ClientGrpc>;
  let cacheService: jest.Mocked<CacheService>;
  let cartServiceGrpc: jest.Mocked<CartServiceGrpc>;

  const mockCart: Cart = {
    id: '1',
    sessionId: 'test-session',
    userId: 'user-1',
    items: [
      {
        productId: 'prod-1',
        sku: 'TEST-001',
        name: 'Test Product',
        price: 100,
        quantity: 2
      }
    ],
    status: CartStatus.ACTIVE,
    subtotal: 200,
    total: 200,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(async () => {
    cartServiceGrpc = {
      createCart: jest.fn(),
      getCart: jest.fn(),
      addItem: jest.fn(),
      updateItem: jest.fn(),
      removeItem: jest.fn(),
      applyDiscount: jest.fn(),
      updateCartStatus: jest.fn(),
      deleteCart: jest.fn(),
    } as any;

    const mockClient = {
      getService: jest.fn().mockReturnValue(cartServiceGrpc),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: 'CART_PACKAGE',
          useValue: mockClient,
        },
        {
          provide: CacheService,
          useValue: {
            getOrSet: jest.fn(),
            set: jest.fn(),
            invalidate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    client = module.get('CART_PACKAGE');
    cacheService = module.get(CacheService);

    service.onModuleInit();
  });

  describe('createCart', () => {
    it('deve criar um novo carrinho', async () => {
      cartServiceGrpc.createCart.mockReturnValue(of(mockCart));

      const result = await service.createCart('test-session', 'user-1');

      expect(result).toEqual(mockCart);
      expect(cartServiceGrpc.createCart).toHaveBeenCalledWith({
        sessionId: 'test-session',
        userId: 'user-1',
        metadata: {}, // Agora esperamos um objeto vazio ao invés de undefined
      });
      expect(cacheService.set).toHaveBeenCalledWith('cart:1', mockCart, 1800);
    });

    it('deve criar um carrinho com metadata personalizado', async () => {
      const metadata = { source: 'web', campaign: 'promo' };
      cartServiceGrpc.createCart.mockReturnValue(of(mockCart));

      const result = await service.createCart('test-session', 'user-1', metadata);

      expect(result).toEqual(mockCart);
      expect(cartServiceGrpc.createCart).toHaveBeenCalledWith({
        sessionId: 'test-session',
        userId: 'user-1',
        metadata,
      });
    });
  });

  describe('getCart', () => {
    it('deve retornar um carrinho do cache quando disponível', async () => {
      cacheService.getOrSet.mockResolvedValue(mockCart);

      const result = await service.getCart('1');

      expect(result).toEqual(mockCart);
      expect(cacheService.getOrSet).toHaveBeenCalledWith(
        'cart:1',
        expect.any(Function),
        1800
      );
    });

    it('deve lançar NotFoundException quando o carrinho não existe', async () => {
      cartServiceGrpc.getCart.mockReturnValue(of({} as Cart)); // Retorna um objeto vazio que será tratado como carrinho não encontrado
      cacheService.getOrSet.mockImplementation(async (key, fn) => fn());

      await expect(service.getCart('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addItem', () => {
    it('deve adicionar um item ao carrinho', async () => {
      const addItemDto: AddItemDto = {
        productId: 'prod-2',
        quantity: 1,
        attributes: { color: 'blue' }
      };

      const updatedCart = {
        ...mockCart,
        items: [
          ...mockCart.items,
          {
            productId: 'prod-2',
            quantity: 1,
            price: 50,
            name: 'New Product',
            sku: 'NEW-001',
          },
        ],
      };

      cartServiceGrpc.addItem.mockReturnValue(of(updatedCart));

      const result = await service.addItem('1', addItemDto);

      expect(result).toEqual(updatedCart);
      expect(cartServiceGrpc.addItem).toHaveBeenCalledWith({
        cartId: '1',
        ...addItemDto
      });
      expect(cacheService.set).toHaveBeenCalledWith('cart:1', updatedCart, 1800);
    });
  });

  describe('updateItem', () => {
    it('deve atualizar um item no carrinho', async () => {
      const updateDto: UpdateItemDto = {
        quantity: 3,
        attributes: { size: 'L' }
      };

      const updatedCart = {
        ...mockCart,
        items: [
          {
            ...mockCart.items[0],
            quantity: 3,
          },
        ],
      };

      cartServiceGrpc.updateItem.mockReturnValue(of(updatedCart));

      const result = await service.updateItem('1', 'prod-1', updateDto);

      expect(result).toEqual(updatedCart);
      expect(cartServiceGrpc.updateItem).toHaveBeenCalledWith({
        cartId: '1',
        productId: 'prod-1',
        ...updateDto
      });
      expect(cacheService.set).toHaveBeenCalledWith('cart:1', updatedCart, 1800);
    });
  });

  describe('removeItem', () => {
    it('deve remover um item do carrinho', async () => {
      const updatedCart = {
        ...mockCart,
        items: [],
        total: 0,
        subtotal: 0
      };

      cartServiceGrpc.removeItem.mockReturnValue(of(updatedCart));

      const result = await service.removeItem('1', 'prod-1');

      expect(result).toEqual(updatedCart);
      expect(cartServiceGrpc.removeItem).toHaveBeenCalledWith({
        cartId: '1',
        productId: 'prod-1'
      });
      expect(cacheService.set).toHaveBeenCalledWith('cart:1', updatedCart, 1800);
    });
  });

  describe('applyDiscount', () => {
    it('deve aplicar um desconto ao carrinho', async () => {
      const updatedCart = {
        ...mockCart,
        discounts: [
          {
            code: 'TEST10',
            amount: 20,
            type: 'percentage' as const
          }
        ],
        total: 180
      };

      cartServiceGrpc.applyDiscount.mockReturnValue(of(updatedCart));

      const result = await service.applyDiscount('1', { code: 'TEST10' });

      expect(result).toEqual(updatedCart);
      expect(cartServiceGrpc.applyDiscount).toHaveBeenCalledWith({
        cartId: '1',
        code: 'TEST10'
      });
      expect(cacheService.set).toHaveBeenCalledWith('cart:1', updatedCart, 1800);
    });
  });

  describe('updateStatus', () => {
    it('deve atualizar o status do carrinho', async () => {
      const updatedCart = {
        ...mockCart,
        status: CartStatus.CHECKOUT
      };

      cartServiceGrpc.updateCartStatus.mockReturnValue(of(updatedCart));

      const result = await service.updateStatus('1', { status: CartStatus.CHECKOUT });

      expect(result).toEqual(updatedCart);
      expect(cartServiceGrpc.updateCartStatus).toHaveBeenCalledWith({
        cartId: '1',
        status: CartStatus.CHECKOUT
      });
      expect(cacheService.set).toHaveBeenCalledWith('cart:1', updatedCart, 1800);
    });
  });

  describe('deleteCart', () => {
    it('deve remover um carrinho', async () => {
      const response = {
        success: true,
        message: 'Carrinho removido com sucesso'
      };

      cartServiceGrpc.deleteCart.mockReturnValue(of(response));

      const result = await service.deleteCart('1');

      expect(result).toEqual(response);
      expect(cartServiceGrpc.deleteCart).toHaveBeenCalledWith({ id: '1' });
      expect(cacheService.invalidate).toHaveBeenCalledWith('cart:1');
    });
  });
});