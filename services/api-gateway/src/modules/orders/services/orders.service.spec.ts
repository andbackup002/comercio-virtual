import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { ClientGrpc } from '@nestjs/microservices';
import { OrderServiceGrpc } from '../interfaces/order-grpc.interface';
import { CreateOrderDto, UpdateOrderStatusDto, CancelOrderDto } from '../dto/order.dto';
import { Order, ListOrdersResponse } from '../interfaces/order.interface';
import { of } from 'rxjs';

describe('OrdersService', () => {
  let ordersService: OrdersService;
  let orderServiceGrpc: OrderServiceGrpc;

  const mockOrder: Order = {
    id: '1',
    user_id: 'user1',
    items: [],
    shipping_address: {
      street: 'street',
      number: '123',
      neighborhood: 'neighborhood',
      city: 'city',
      state: 'state',
      zip_code: '12345-678',
      country: 'country',
    },
    payment_info: {
      payment_id: 'payment_id',
      status: 'approved',
      method: 'credit_card',
      amount: 100,
      currency: 'BRL',
    },
    status: 'pending',
    subtotal: 80,
    shipping_cost: 20,
    total: 100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockOrderServiceGrpc = {
    createOrder: jest.fn().mockReturnValue(of(mockOrder)),
    getOrder: jest.fn().mockReturnValue(of(mockOrder)),
    listOrders: jest.fn().mockReturnValue(of({
      orders: [mockOrder],
      total: 1,
      page: 1,
      total_pages: 1
    })),
    updateOrderStatus: jest.fn().mockReturnValue(of(mockOrder)),
    cancelOrder: jest.fn().mockReturnValue(of(mockOrder)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: 'ORDER_PACKAGE',
          useValue: {
            getService: () => mockOrderServiceGrpc,
          },
        },
      ],
    }).compile();

    ordersService = module.get<OrdersService>(OrdersService);
    ordersService.onModuleInit();
  });

  describe('createOrder', () => {
    it('should create an order', async () => {
      const createOrderDto: CreateOrderDto = {
        user_id: 'user1',
        items: [],
        shipping_address: {
          street: 'street',
          number: '123',
          neighborhood: 'neighborhood',
          city: 'city',
          state: 'state',
          zip_code: '12345-678',
          country: 'country',
        },
        payment_info: {
          payment_id: 'payment_id',
          status: 'approved',
          method: 'credit_card',
          amount: 100,
          currency: 'BRL',
        },
      };

      const result = await ordersService.createOrder(createOrderDto);
      expect(mockOrderServiceGrpc.createOrder).toHaveBeenCalledWith(createOrderDto);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('getOrder', () => {
    it('should get an order by ID', async () => {
      const id = '1';
      const result = await ordersService.getOrder(id);
      expect(mockOrderServiceGrpc.getOrder).toHaveBeenCalledWith({ id });
      expect(result).toEqual(mockOrder);
    });
  });

  describe('listOrders', () => {
    it('should list orders', async () => {
      const userId = 'user1';
      const result = await ordersService.listOrders(userId, undefined, 1, 10);
      expect(mockOrderServiceGrpc.listOrders).toHaveBeenCalledWith({
        user_id: userId,
        status: undefined,
        page: 1,
        limit: 10,
      });
      expect(result).toEqual({
        orders: [mockOrder],
        total: 1,
        page: 1,
        total_pages: 1
      });
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      const id = '1';
      const updateOrderStatusDto: UpdateOrderStatusDto = { status: 'shipped' };
      const result = await ordersService.updateOrderStatus(id, updateOrderStatusDto);
      expect(mockOrderServiceGrpc.updateOrderStatus).toHaveBeenCalledWith({
        id,
        ...updateOrderStatusDto,
      });
      expect(result).toEqual(mockOrder);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel an order', async () => {
      const id = '1';
      const cancelOrderDto: CancelOrderDto = { reason: 'no stock' };
      const result = await ordersService.cancelOrder(id, cancelOrderDto);
      expect(mockOrderServiceGrpc.cancelOrder).toHaveBeenCalledWith({
        id,
        reason: cancelOrderDto.reason,
      });
      expect(result).toEqual(mockOrder);
    });
  });
});
