import { Observable } from 'rxjs';
import { Cart } from './cart.interface';

export interface CartServiceGrpc {
  createCart(data: {
    sessionId: string;
    userId?: string;
    metadata?: any;
  }): Observable<Cart>;

  getCart(data: { id: string }): Observable<Cart>;

  addItem(data: {
    cartId: string;
    productId: string;
    quantity: number;
    attributes?: any;
  }): Observable<Cart>;

  updateItem(data: {
    cartId: string;
    productId: string;
    quantity: number;
    attributes?: any;
  }): Observable<Cart>;

  removeItem(data: {
    cartId: string;
    productId: string;
  }): Observable<Cart>;

  applyDiscount(data: {
    cartId: string;
    code: string;
  }): Observable<Cart>;

  updateCartStatus(data: {
    cartId: string;
    status: string;
  }): Observable<Cart>;

  deleteCart(data: {
    id: string;
  }): Observable<{ success: boolean; message: string }>;
}