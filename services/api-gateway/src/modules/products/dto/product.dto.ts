import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
  ValidateNested,
  IsObject,
  Min,
  Max,
} from 'class-validator';

export class DimensionsDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  length = 0;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  width = 0;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  height = 0;
}

export class ProductSeoDto {
  @ApiProperty()
  @IsString()
  title = '';

  @ApiProperty()
  @IsString()
  description = '';

  @ApiProperty()
  @IsString()
  keywords = '';

  @ApiProperty()
  @IsString()
  slug = '';
}

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  name = '';

  @ApiProperty()
  @IsString()
  description = '';

  @ApiProperty()
  @IsString()
  shortDescription = '';

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price = 0;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  stock = 0;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  minStock = 0;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  maxStock = 0;

  @ApiProperty()
  @IsString()
  category = '';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  tags: string[] = [];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  images: string[] = [];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  dimensions?: DimensionsDto;

  @ApiProperty()
  @IsObject()
  attributes: Record<string, string> = {};

  @ApiProperty()
  @IsBoolean()
  featured = false;

  @ApiProperty()
  @ValidateNested()
  seo = new ProductSeoDto();
}

export class UpdateProductDto extends CreateProductDto {}

export class UpdateStockDto {
  @ApiProperty({ enum: ['add', 'subtract', 'set'] })
  @IsString()
  operation = 'set';

  @ApiProperty()
  @IsNumber()
  @Min(0)
  quantity = 0;

  @ApiProperty({ description: 'Motivo da atualização do estoque', required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}