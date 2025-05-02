import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { NotificationServiceGrpc } from '../interfaces/notification-grpc.interface';
import { SendNotificationDto, ListNotificationsQueryDto } from '../dto/notification.dto';
import { Notification, NotificationRequest } from '../interfaces/notification.interface';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private notificationService!: NotificationServiceGrpc;

  constructor(@Inject('NOTIFICATION_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.notificationService = this.client.getService<NotificationServiceGrpc>('NotificationService');
  }

  async sendNotification(notificationDto: SendNotificationDto): Promise<Notification> {
    const request: NotificationRequest = {
      recipient: notificationDto.recipient,
      type: notificationDto.type,
      content: notificationDto.content,
      template: notificationDto.template,
      templateData: notificationDto.templateData
    };
    return lastValueFrom(this.notificationService.sendNotification(request));
  }

  async getNotification(id: string): Promise<Notification> {
    return lastValueFrom(this.notificationService.getNotification({ id }));
  }

  async listNotifications(query: ListNotificationsQueryDto) {
    const { recipientId, type, status, page = 1, limit = 10 } = query;
    return lastValueFrom(
      this.notificationService.listNotifications({
        userId: recipientId || '',  // Garantindo que userId nunca será undefined
        type,
        status,
        page,
        limit,
      })
    );
  }
}