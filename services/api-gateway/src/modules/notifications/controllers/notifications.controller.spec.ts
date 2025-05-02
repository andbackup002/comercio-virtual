import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from '../services/notifications.service';
import { SendNotificationDto, ListNotificationsQueryDto } from '../dto/notification.dto';
import { Notification } from '../interfaces/notification.interface';
import { NotificationType } from '../dto/notification.dto';

describe('NotificationsController', () => {
  let notificationsController: NotificationsController;
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: {
            sendNotification: jest.fn().mockResolvedValue(mockNotification),
            getNotification: jest.fn().mockResolvedValue(mockNotification),
            listNotifications: jest.fn().mockResolvedValue([mockNotification]),
          },
        },
      ],
    }).compile();

    notificationsController = module.get<NotificationsController>(NotificationsController);
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(notificationsController).toBeDefined();
  });

  describe('sendNotification', () => {
    it('should send a notification', async () => {
      const notificationDto: SendNotificationDto = {
        recipient: 'user1',
        type: NotificationType.EMAIL,
        content: 'Seu pedido foi atualizado.',
      };
      const result = await notificationsController.sendNotification(notificationDto);
      expect(notificationsService.sendNotification).toHaveBeenCalledWith(notificationDto);
      expect(result).toEqual(mockNotification);
    });
  });

  describe('getNotification', () => {
    it('should get a notification by ID', async () => {
      const id = '1';
      const result = await notificationsController.getNotification(id);
      expect(notificationsService.getNotification).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockNotification);
    });
  });

  describe('listNotifications', () => {
    it('should list notifications', async () => {
      const query: ListNotificationsQueryDto = { limit: 10, page: 1 };
      const result = await notificationsController.listNotifications(query);
      expect(notificationsService.listNotifications).toHaveBeenCalledWith(query);
      expect(result).toEqual([mockNotification]);
    });
  });
});
