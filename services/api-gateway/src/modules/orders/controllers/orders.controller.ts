import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, CancelOrderDto } from '../dto/order.dto';
import { Order } from '../interfaces/order.interface';

/**
 * Controlador responsável por gerenciar os pedidos
 * Fornece endpoints para criação, consulta, atualização e cancelamento de pedidos
 */
@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Cria um novo pedido
   * @param createOrderDto Dados do pedido a ser criado
   */
  @Post()
  @ApiOperation({ summary: 'Criar um novo pedido' })
  @ApiResponse({ status: 201, description: 'Pedido criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 422, description: 'Erro na criação do pedido' })
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.ordersService.createOrder(createOrderDto);
  }

  /**
   * Busca um pedido específico por ID
   * @param id ID do pedido
   */
  @Get(':id')
  @ApiOperation({ summary: 'Buscar um pedido pelo ID' })
  @ApiResponse({ status: 200, description: 'Pedido encontrado' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  async getOrder(@Param('id') id: string): Promise<Order> {
    return this.ordersService.getOrder(id);
  }

  /**
   * Lista pedidos com filtros e paginação
   * @param userId ID do usuário para filtrar pedidos
   * @param status Status do pedido para filtrar
   * @param page Número da página
   * @param limit Limite de itens por página
   */
  @Get()
  @ApiOperation({ summary: 'Listar pedidos' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos retornada com sucesso' })
  async listOrders(
    @Query('userId') userId: string,
    @Query('status') status?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.ordersService.listOrders(userId, status, page, limit);
  }

  /**
   * Atualiza o status de um pedido
   * @param id ID do pedido
   * @param updateOrderStatusDto Dados da atualização do status
   */
  @Put(':id/status')
  @ApiOperation({ summary: 'Atualizar status do pedido' })
  @ApiResponse({ status: 200, description: 'Status do pedido atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return this.ordersService.updateOrderStatus(id, updateOrderStatusDto);
  }

  /**
   * Cancela um pedido
   * @param id ID do pedido
   * @param cancelOrderDto Dados do cancelamento
   */
  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancelar pedido' })
  @ApiResponse({ status: 200, description: 'Pedido cancelado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  @ApiResponse({ status: 422, description: 'Erro ao cancelar o pedido' })
  async cancelOrder(
    @Param('id') id: string,
    @Body() cancelOrderDto: CancelOrderDto,
  ): Promise<Order> {
    return this.ordersService.cancelOrder(id, cancelOrderDto);
  }
}