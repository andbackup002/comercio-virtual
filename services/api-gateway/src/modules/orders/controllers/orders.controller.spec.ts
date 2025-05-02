import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, CancelOrderDto } from '../dto/order.dto';
import { Order } from '../interfaces/order.interface';

describe('OrdersController', () => {
  let ordersController: OrdersController;
  let ordersService: OrdersService;

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
    subtotal: 80,
    shipping_cost: 20,
    total: 100,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: {
            createOrder: jest.fn().mockResolvedValue(mockOrder),
            getOrder: jest.fn().mockResolvedValue(mockOrder),
            listOrders: jest.fn().mockResolvedValue([mockOrder]),
            updateOrderStatus: jest.fn().mockResolvedValue(mockOrder),
            cancelOrder: jest.fn().mockResolvedValue(mockOrder),
          },
        },
      ],
    }).compile();

    ordersController = module.get<OrdersController>(OrdersController);
    ordersService = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(ordersController).toBeDefined();
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
      const result = await ordersController.createOrder(createOrderDto);
      expect(ordersService.createOrder).toHaveBeenCalledWith(createOrderDto);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('getOrder', () => {
    it('should get an order by ID', async () => {
      const id = '1';
      const result = await ordersController.getOrder(id);
      expect(ordersService.getOrder).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('listOrders', () => {
    it('should list orders', async () => {
      const userId = 'user1';
      const result = await ordersController.listOrders(userId, undefined, 1, 10);
      expect(ordersService.listOrders).toHaveBeenCalledWith(userId, undefined, 1, 10);
      expect(result).toEqual([mockOrder]);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      const id = '1';
      const updateOrderStatusDto: UpdateOrderStatusDto = { status: 'shipped' };
      const result = await ordersController.updateOrderStatus(id, updateOrderStatusDto);
      expect(ordersService.updateOrderStatus).toHaveBeenCalledWith(id, updateOrderStatusDto);
      expect(result).toEqual(mockOrder);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel an order', async () => {
      const id = '1';
      const cancelOrderDto: CancelOrderDto = { reason: 'no stock' };
      const result = await ordersController.cancelOrder(id, cancelOrderDto);
      expect(ordersService.cancelOrder).toHaveBeenCalledWith(id, cancelOrderDto);
      expect(result).toEqual(mockOrder);
    });
  });
});
