import { Observable } from 'rxjs';
import { Notification, NotificationRequest } from './notification.interface';

export interface NotificationServiceGrpc {
  sendNotification(data: NotificationRequest): Observable<Notification>;
  getNotification(data: { id: string }): Observable<Notification>;
  listNotifications(data: {
    userId: string;
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Observable<{
    notifications: Notification[];
    total: number;
    page: number;
    totalPages: number;
  }>;
}