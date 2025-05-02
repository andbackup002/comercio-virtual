import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { ClientGrpc } from '@nestjs/microservices';
import { NotificationServiceGrpc } from '../interfaces/notification-grpc.interface';
import { SendNotificationDto, NotificationType, ListNotificationsQueryDto } from '../dto/notification.dto';
import { Notification } from '../interfaces/notification.interface';
import { of } from 'rxjs';

describe('NotificationsService', () => {
  let notificationsService: NotificationsService;

  const mockNotification: Notification = {
    id: '1',
    recipient: 'user1',
    type: NotificationType.EMAIL,
    content: 'Seu pedido foi atualizado.',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockNotificationServiceGrpc = {
    sendNotification: jest.fn().mockReturnValue(of(mockNotification)),
    getNotification: jest.fn().mockReturnValue(of(mockNotification)),
    listNotifications: jest.fn().mockReturnValue(of({
      notifications: [mockNotification],
      total: 1,
      page: 1,
      totalPages: 1
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: 'NOTIFICATION_PACKAGE',
          useValue: {
            getService: () => mockNotificationServiceGrpc,
          },
        },
      ],
    }).compile();

    notificationsService = module.get<NotificationsService>(NotificationsService);
    notificationsService.onModuleInit(); // Adicionando a chamada de inicialização
  });

  it('should be defined', () => {
    expect(notificationsService).toBeDefined();
  });

  describe('sendNotification', () => {
    it('should send a notification', async () => {
      const notificationDto: SendNotificationDto = {
        recipient: 'user1',
        type: NotificationType.EMAIL,
        content: 'Seu pedido foi atualizado.',
      };
      const result = await notificationsService.sendNotification(notificationDto);
      expect(mockNotificationServiceGrpc.sendNotification).toHaveBeenCalled();
      expect(result).toEqual(mockNotification);
    });
  });

  describe('getNotification', () => {
    it('should get a notification by ID', async () => {
      const id = '1';
      const result = await notificationsService.getNotification(id);
      expect(mockNotificationServiceGrpc.getNotification).toHaveBeenCalledWith({ id });
      expect(result).toEqual(mockNotification);
    });
  });

  describe('listNotifications', () => {
    it('should list notifications', async () => {
      const query: ListNotificationsQueryDto = { limit: 10, page: 1 };
      const result = await notificationsService.listNotifications(query);
      expect(mockNotificationServiceGrpc.listNotifications).toHaveBeenCalledWith({
        userId: '',
        type: undefined,
        status: undefined,
        page: 1,
        limit: 10,
      });
      expect(result).toEqual({
        notifications: [mockNotification],
        total: 1,
        page: 1,
        totalPages: 1
      });
    });
  });
});
