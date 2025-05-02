import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from '../services/cart.service';
import { AddItemDto, UpdateItemDto, ApplyDiscountDto, UpdateCartStatusDto } from '../dto/cart.dto';
import { Cart, CartStatus, CartDiscount } from '../interfaces/cart.interface';

describe('CartController', () => {
  let controller: CartController;
  let service: jest.Mocked<CartService>;

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
        quantity: 2,
      },
    ],
    status: CartStatus.ACTIVE,
    subtotal: 200,
    total: 200,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockCartService = {
      createCart: jest.fn(),
      getCart: jest.fn(),
      addItem: jest.fn(),
      updateItem: jest.fn(),
      removeItem: jest.fn(),
      applyDiscount: jest.fn(),
      updateStatus: jest.fn(),
      deleteCart: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: mockCartService,
        },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
    service = module.get(CartService);
  });

  describe('createCart', () => {
    it('deve criar um novo carrinho', async () => {
      const session = { id: 'test-session' };
      const req = { user: { id: 'user-1' } };
      const metadata = { metadata: { source: 'web' } };

      service.createCart.mockResolvedValue(mockCart);

      const result = await controller.createCart(session, req, metadata);

      expect(result).toEqual(mockCart);
      expect(service.createCart).toHaveBeenCalledWith(
        'test-session',
        'user-1',
        { source: 'web' }
      );
    });
  });

  describe('getCart', () => {
    it('deve retornar um carrinho pelo ID', async () => {
      service.getCart.mockResolvedValue(mockCart);

      const result = await controller.getCart('1');

      expect(result).toEqual(mockCart);
      expect(service.getCart).toHaveBeenCalledWith('1');
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
            sku: 'NEW-001',
            name: 'New Product',
            price: 50,
            quantity: 1,
          },
        ],
      };

      service.addItem.mockResolvedValue(updatedCart);

      const result = await controller.addItem('1', addItemDto);

      expect(result).toEqual(updatedCart);
      expect(service.addItem).toHaveBeenCalledWith('1', addItemDto);
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

      service.updateItem.mockResolvedValue(updatedCart);

      const result = await controller.updateItem('1', 'prod-1', updateDto);

      expect(result).toEqual(updatedCart);
      expect(service.updateItem).toHaveBeenCalledWith('1', 'prod-1', updateDto);
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

      service.removeItem.mockResolvedValue(updatedCart);

      const result = await controller.removeItem('1', 'prod-1');

      expect(result).toEqual(updatedCart);
      expect(service.removeItem).toHaveBeenCalledWith('1', 'prod-1');
    });
  });

  describe('applyDiscount', () => {
    it('deve aplicar um desconto ao carrinho', async () => {
      const discountDto: ApplyDiscountDto = {
        code: 'TEST10'
      };

      const updatedCart: Cart = {
        ...mockCart,
        discounts: [
          {
            code: 'TEST10',
            amount: 20,
            type: 'percentage' as const
          } satisfies CartDiscount
        ],
        total: 180
      };

      service.applyDiscount.mockResolvedValue(updatedCart);

      const result = await controller.applyDiscount('1', discountDto);

      expect(result).toEqual(updatedCart);
      expect(service.applyDiscount).toHaveBeenCalledWith('1', discountDto);
    });
  });

  describe('updateStatus', () => {
    it('deve atualizar o status do carrinho', async () => {
      const statusDto: UpdateCartStatusDto = {
        status: CartStatus.CHECKOUT
      };

      const updatedCart = {
        ...mockCart,
        status: CartStatus.CHECKOUT
      };

      service.updateStatus.mockResolvedValue(updatedCart);

      const result = await controller.updateStatus('1', statusDto);

      expect(result).toEqual(updatedCart);
      expect(service.updateStatus).toHaveBeenCalledWith('1', statusDto);
    });
  });

  describe('deleteCart', () => {
    it('deve remover um carrinho', async () => {
      const response = {
        success: true,
        message: 'Carrinho removido com sucesso'
      };

      service.deleteCart.mockResolvedValue(response);

      const result = await controller.deleteCart('1');

      expect(result).toEqual(response);
      expect(service.deleteCart).toHaveBeenCalledWith('1');
    });
  });
});