import { Observable } from 'rxjs';
import { Order, ListOrdersResponse } from './order.interface';

export interface OrderServiceGrpc {
  createOrder(data: {
    user_id: string;
    items: Array<{
      product_id: string;
      name: string;
      quantity: number;
      unit_price: number;
      subtotal: number;
    }>;
    shipping_address: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      zip_code: string;
      country: string;
    };
    payment_info: {
      payment_id: string;
      status: string;
      method: string;
      last_four_digits?: string;
      amount: number;
      currency: string;
      paid_at?: string;
    };
  }): Observable<Order>;

  getOrder(data: { id: string }): Observable<Order>;

  listOrders(data: {
    user_id: string;
    status?: string;
    page: number;
    limit: number;
  }): Observable<ListOrdersResponse>;

  updateOrderStatus(data: {
    id: string;
    status: string;
    tracking_code?: string;
    shipping_company?: string;
  }): Observable<Order>;

  cancelOrder(data: { id: string; reason: string }): Observable<Order>;
}