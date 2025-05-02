import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { OrderServiceGrpc } from '../interfaces/order-grpc.interface';
import { CreateOrderDto, UpdateOrderStatusDto, CancelOrderDto } from '../dto/order.dto';
import { Order, ListOrdersResponse } from '../interfaces/order.interface';

@Injectable()
export class OrdersService implements OnModuleInit {
  private orderService!: OrderServiceGrpc;

  constructor(@Inject('ORDER_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.orderService = this.client.getService<OrderServiceGrpc>('OrderService');
  }

  async createOrder(data: CreateOrderDto): Promise<Order> {
    return lastValueFrom(this.orderService.createOrder(data));
  }

  async getOrder(id: string): Promise<Order> {
    return lastValueFrom(this.orderService.getOrder({ id }));
  }

  async listOrders(userId: string, status?: string, page = 1, limit = 10): Promise<ListOrdersResponse> {
    return lastValueFrom(
      this.orderService.listOrders({
        user_id: userId,
        status,
        page,
        limit,
      }),
    );
  }

  async updateOrderStatus(id: string, data: UpdateOrderStatusDto): Promise<Order> {
    return lastValueFrom(
      this.orderService.updateOrderStatus({
        id,
        ...data,
      }),
    );
  }

  async cancelOrder(id: string, data: CancelOrderDto): Promise<Order> {
    return lastValueFrom(
      this.orderService.cancelOrder({
        id,
        reason: data.reason,
      }),
    );
  }
}