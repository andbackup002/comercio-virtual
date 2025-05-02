import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { PaymentServiceGrpc } from '../interfaces/payment-grpc.interface';
import { ProcessPaymentDto, RefundPaymentDto } from '../dto/payment.dto';
import { Payment, ListPaymentsResponse } from '../interfaces/payment.interface';

@Injectable()
export class PaymentsService implements OnModuleInit {
  private paymentService!: PaymentServiceGrpc;

  constructor(@Inject('PAYMENT_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.paymentService = this.client.getService<PaymentServiceGrpc>('PaymentService');
  }

  async processPayment(data: ProcessPaymentDto): Promise<Payment> {
    return lastValueFrom(this.paymentService.processPayment(data));
  }

  async getPayment(id: string): Promise<Payment> {
    return lastValueFrom(this.paymentService.getPayment({ id }));
  }

  async refundPayment(id: string, data: RefundPaymentDto): Promise<Payment> {
    return lastValueFrom(
      this.paymentService.refundPayment({
        id,
        ...data,
      }),
    );
  }

  async listPayments(userId: string, status?: string, page = 1, limit = 10): Promise<ListPaymentsResponse> {
    return lastValueFrom(
      this.paymentService.listPayments({
        user_id: userId,
        status,
        page,
        limit,
      }),
    );
  }
}