import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';

export enum NotificationType {
  EMAIL = 'email',
  PUSH = 'push',
  WEBSOCKET = 'websocket'
}

export class SendNotificationDto {
  @IsString()
  recipient!: string;

  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsString()
  content!: string;

  @IsString()
  @IsOptional()
  template?: string;

  @IsOptional()
  templateData?: Record<string, any>;
}

export class ListNotificationsQueryDto {
  @IsString()
  @IsOptional()
  recipientId?: string;

  @IsEnum(NotificationType, { each: true })
  @IsOptional()
  type?: NotificationType;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number;
}