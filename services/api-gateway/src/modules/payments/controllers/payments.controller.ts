import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { PaymentsService } from '../services/payments.service';
import { ProcessPaymentDto, RefundPaymentDto } from '../dto/payment.dto';
import { Payment } from '../interfaces/payment.interface';

/**
 * Controlador responsável por gerenciar os pagamentos
 * Fornece endpoints para processamento, consulta, reembolso e listagem de pagamentos
 */
@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Processa um novo pagamento
   * @param processPaymentDto Dados do pagamento a ser processado
   */
  @Post()
  @ApiOperation({ summary: 'Processar um novo pagamento' })
  @ApiResponse({ status: 201, description: 'Pagamento processado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 422, description: 'Erro no processamento do pagamento' })
  async processPayment(@Body() processPaymentDto: ProcessPaymentDto): Promise<Payment> {
    return this.paymentsService.processPayment(processPaymentDto);
  }

  /**
   * Busca um pagamento específico por ID
   * @param id ID do pagamento
   */
  @Get(':id')
  @ApiOperation({ summary: 'Buscar um pagamento pelo ID' })
  @ApiResponse({ status: 200, description: 'Pagamento encontrado' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado' })
  async getPayment(@Param('id') id: string): Promise<Payment> {
    return this.paymentsService.getPayment(id);
  }

  /**
   * Processa o reembolso de um pagamento
   * @param id ID do pagamento a ser reembolsado
   * @param refundPaymentDto Dados do reembolso
   */
  @Put(':id/refund')
  @ApiOperation({ summary: 'Reembolsar um pagamento' })
  @ApiResponse({ status: 200, description: 'Pagamento reembolsado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Pagamento não encontrado' })
  @ApiResponse({ status: 422, description: 'Erro no processamento do reembolso' })
  async refundPayment(
    @Param('id') id: string,
    @Body() refundPaymentDto: RefundPaymentDto,
  ): Promise<Payment> {
    return this.paymentsService.refundPayment(id, refundPaymentDto);
  }

  /**
   * Lista pagamentos com filtros e paginação
   * @param userId ID do usuário para filtrar pagamentos
   * @param status Status do pagamento para filtrar
   * @param page Número da página
   * @param limit Limite de itens por página
   */
  @Get()
  @ApiOperation({ summary: 'Listar pagamentos' })
  @ApiResponse({ status: 200, description: 'Lista de pagamentos retornada com sucesso' })
  async listPayments(
    @Query('userId') userId: string,
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.paymentsService.listPayments(userId, status, page, limit);
  }
}