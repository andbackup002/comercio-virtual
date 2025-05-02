import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class PaymentMethodDto {
  @ApiProperty({ description: 'Tipo de pagamento (credit_card, pix, boleto)' })
  @IsString()
  type: string = '';

  @ApiPropertyOptional({ description: 'Bandeira do cartão' })
  @IsString()
  @IsOptional()
  card_brand?: string;

  @ApiPropertyOptional({ description: 'Últimos 4 dígitos do cartão' })
  @IsString()
  @IsOptional()
  last_four_digits?: string;

  @ApiPropertyOptional({ description: 'Nome do titular do cartão' })
  @IsString()
  @IsOptional()
  holder_name?: string;

  @ApiPropertyOptional({ description: 'Mês de expiração do cartão' })
  @IsString()
  @IsOptional()
  expiry_month?: string;

  @ApiPropertyOptional({ description: 'Ano de expiração do cartão' })
  @IsString()
  @IsOptional()
  expiry_year?: string;

  @ApiPropertyOptional({ description: 'URL do boleto' })
  @IsString()
  @IsOptional()
  boleto_url?: string;

  @ApiPropertyOptional({ description: 'QR Code do PIX' })
  @IsString()
  @IsOptional()
  pix_qr_code?: string;

  @ApiPropertyOptional({ description: 'Código PIX copia e cola' })
  @IsString()
  @IsOptional()
  pix_copy_paste?: string;
}

export class ProcessPaymentDto {
  @ApiProperty({ description: 'ID do pedido' })
  @IsString()
  order_id: string = '';

  @ApiProperty({ description: 'ID do usuário' })
  @IsString()
  user_id: string = '';

  @ApiProperty({ description: 'Valor do pagamento' })
  @IsNumber()
  @Min(0)
  amount: number = 0;

  @ApiProperty({ description: 'Moeda (ex: BRL)' })
  @IsString()
  currency: string = 'BRL';

  @ApiProperty({ description: 'Método de pagamento' })
  payment_method: PaymentMethodDto = new PaymentMethodDto();
}

export class RefundPaymentDto {
  @ApiProperty({ description: 'Valor do reembolso' })
  @IsNumber()
  @Min(0)
  amount: number = 0;

  @ApiProperty({ description: 'Motivo do reembolso' })
  @IsString()
  reason: string = '';
}