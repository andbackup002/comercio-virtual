import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { NotificationsService } from '../services/notifications.service';
import { SendNotificationDto, ListNotificationsQueryDto } from '../dto/notification.dto';
import { Notification } from '../interfaces/notification.interface';

/**
 * Controlador responsável por gerenciar as notificações
 * Fornece endpoints para envio, consulta e listagem de notificações
 */
@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Envia uma nova notificação
   * @param notificationDto Dados da notificação a ser enviada
   */
  @Post()
  @ApiOperation({ summary: 'Enviar uma nova notificação' })
  @ApiResponse({ status: 201, description: 'Notificação enviada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async sendNotification(@Body() notificationDto: SendNotificationDto): Promise<Notification> {
    return this.notificationsService.sendNotification(notificationDto);
  }

  /**
   * Busca uma notificação específica por ID
   * @param id ID da notificação
   */
  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma notificação pelo ID' })
  @ApiResponse({ status: 200, description: 'Notificação encontrada' })
  @ApiResponse({ status: 404, description: 'Notificação não encontrada' })
  async getNotification(@Param('id') id: string): Promise<Notification> {
    return this.notificationsService.getNotification(id);
  }

  /**
   * Lista notificações com filtros e paginação
   * @param query Parâmetros de consulta para filtrar e paginar
   */
  @Get()
  @ApiOperation({ summary: 'Listar notificações' })
  @ApiResponse({ status: 200, description: 'Lista de notificações retornada com sucesso' })
  async listNotifications(@Query() query: ListNotificationsQueryDto) {
    return this.notificationsService.listNotifications(query);
  }
}