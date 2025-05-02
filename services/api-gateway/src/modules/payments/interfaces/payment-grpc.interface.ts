import { Observable } from 'rxjs';
import { Payment, ListPaymentsResponse } from './payment.interface';

export interface PaymentServiceGrpc {
  processPayment(data: {
    order_id: string;
    user_id: string;
    amount: number;
    currency: string;
    payment_method: {
      type: string;
      card_brand?: string;
      last_four_digits?: string;
      holder_name?: string;
      expiry_month?: string;
      expiry_year?: string;
      boleto_url?: string;
      pix_qr_code?: string;
      pix_copy_paste?: string;
    };
  }): Observable<Payment>;

  getPayment(data: { id: string }): Observable<Payment>;

  refundPayment(data: {
    id: string;
    amount: number;
    reason: string;
  }): Observable<Payment>;

  listPayments(data: {
    user_id: string;
    status?: string;
    page: number;
    limit: number;
  }): Observable<ListPaymentsResponse>;
}