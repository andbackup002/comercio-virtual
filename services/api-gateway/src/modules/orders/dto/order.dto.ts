import { IsString, IsNumber, IsArray, ValidateNested, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString()
  product_id: string = '';

  @IsString()
  name: string = '';

  @IsNumber()
  @Min(1)
  quantity: number = 1;

  @IsNumber()
  @Min(0)
  unit_price: number = 0;

  @IsNumber()
  @Min(0)
  subtotal: number = 0;
}

export class AddressInfoDto {
  @IsString()
  street: string = '';

  @IsString()
  number: string = '';

  @IsString()
  @IsOptional()
  complement?: string;

  @IsString()
  neighborhood: string = '';

  @IsString()
  city: string = '';

  @IsString()
  state: string = '';

  @IsString()
  zip_code: string = '';

  @IsString()
  country: string = '';
}

export class PaymentInfoDto {
  @IsString()
  payment_id: string = '';

  @IsString()
  status: string = '';

  @IsString()
  method: string = '';

  @IsString()
  @IsOptional()
  last_four_digits?: string;

  @IsNumber()
  @Min(0)
  amount: number = 0;

  @IsString()
  currency: string = 'BRL';

  @IsString()
  @IsOptional()
  paid_at?: string;
}

export class CreateOrderDto {
  @IsString()
  user_id: string = '';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[] = [];

  @ValidateNested()
  @Type(() => AddressInfoDto)
  shipping_address: AddressInfoDto = new AddressInfoDto();

  @ValidateNested()
  @Type(() => PaymentInfoDto)
  payment_info: PaymentInfoDto = new PaymentInfoDto();
}

export class UpdateOrderStatusDto {
  @IsString()
  status: string = '';
}

export class CancelOrderDto {
  @IsString()
  reason: string = '';
}