import { Observable } from 'rxjs';
import { CreateProductDto, UpdateProductDto } from '../dto/product.dto';
import { Product } from './product.interface';

export interface ProductServiceGrpc {
  listProducts(data: any): Observable<any>;
  searchProducts(data: any): Observable<any>;
  getProduct(data: { id: string }): Observable<Product>;
  createProduct(data: CreateProductDto): Observable<Product>;
  updateProduct(data: { id: string } & UpdateProductDto): Observable<Product>;
  deleteProduct(data: { id: string }): Observable<{ success: boolean; message: string }>;
  updateStock(data: {
    id: string;
    operation: 'add' | 'subtract' | 'set';
    quantity: number;
    reason?: string;
  }): Observable<Product>;
}