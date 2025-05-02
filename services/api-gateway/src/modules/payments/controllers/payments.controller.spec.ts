import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from '../services/payments.service';
import { ProcessPaymentDto, RefundPaymentDto } from '../dto/payment.dto';
import { Payment } from '../interfaces/payment.interface';

describe('PaymentsController', () => {
  let paymentsController: PaymentsController;
  let paymentsService: PaymentsService;

  const mockPayment: Payment = {
    id: '1',
    user_id: 'user1',
    order_id: 'order1',
    amount: 100,
    currency: 'BRL',
    status: 'approved',
    payment_method: { type: 'credit_card' },
    gateway_response: 'approved',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: {
            processPayment: jest.fn().mockResolvedValue(mockPayment),
            getPayment: jest.fn().mockResolvedValue(mockPayment),
            refundPayment: jest.fn().mockResolvedValue(mockPayment),
            listPayments: jest.fn().mockResolvedValue([mockPayment]),
          },
        },
      ],
    }).compile();

    paymentsController = module.get<PaymentsController>(PaymentsController);
    paymentsService = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(paymentsController).toBeDefined();
  });

  describe('processPayment', () => {
    it('should process a payment', async () => {
      const processPaymentDto: ProcessPaymentDto = {
        user_id: 'user1',
        order_id: 'order1',
        amount: 100,
        currency: 'BRL',
        payment_method: { type: 'credit_card' },
      };
      const result = await paymentsController.processPayment(processPaymentDto);
      expect(paymentsService.processPayment).toHaveBeenCalledWith(processPaymentDto);
      expect(result).toEqual(mockPayment);
    });
  });

  describe('getPayment', () => {
    it('should get a payment by ID', async () => {
      const id = '1';
      const result = await paymentsController.getPayment(id);
      expect(paymentsService.getPayment).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockPayment);
    });
  });

  describe('refundPayment', () => {
    it('should refund a payment', async () => {
      const id = '1';
      const refundPaymentDto: RefundPaymentDto = {
        amount: 100,
        reason: 'no stock'
      };
      const result = await paymentsController.refundPayment(id, refundPaymentDto);
      expect(paymentsService.refundPayment).toHaveBeenCalledWith(id, refundPaymentDto);
      expect(result).toEqual(mockPayment);
    });
  });

  describe('listPayments', () => {
    it('should list payments', async () => {
      const userId = 'user1';
      const result = await paymentsController.listPayments(userId, undefined, 1, 10);
      expect(paymentsService.listPayments).toHaveBeenCalledWith(userId, undefined, 1, 10);
      expect(result).toEqual([mockPayment]);
    });
  });
});
