import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsObject,
  IsArray,
  IsBoolean,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CartStatus } from '../interfaces/cart.interface';

export class AddItemDto {
  @ApiProperty({ description: 'ID do produto' })
  @IsString()
  productId = '';

  @ApiProperty({ description: 'Quantidade do item', minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity = 1;

  @ApiProperty({ description: 'Atributos adicionais do item (cor, tamanho, etc)', required: false })
  @IsObject()
  @IsOptional()
  attributes?: Record<string, any> = {};
}

export class UpdateItemDto {
  @ApiProperty({ description: 'Nova quantidade do item', minimum: 0 })
  @IsNumber()
  @Min(0)
  quantity = 0;

  @ApiProperty({ description: 'Atributos adicionais do item (cor, tamanho, etc)', required: false })
  @IsObject()
  @IsOptional()
  attributes?: Record<string, any> = {};
}

export class ApplyDiscountDto {
  @ApiProperty({ description: 'Código do cupom de desconto' })
  @IsString()
  code = '';
}

export class UpdateCartStatusDto {
  @ApiProperty({ description: 'Novo status do carrinho', enum: CartStatus })
  @IsEnum(CartStatus)
  status = CartStatus.ACTIVE;
}

export class CartMetadataDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: { [key: string]: any } = {};
}

export class CartConfigDto {
  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(100)
  maxItemQuantity = 10;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  minItemQuantity = 1;

  @ApiProperty()
  @IsNumber()
  @Min(5)
  expireInMinutes = 1440; // 24 horas

  @ApiProperty()
  @IsBoolean()
  allowAnonymous = true;

  @ApiProperty()
  @IsBoolean()
  requireStock = true;
}