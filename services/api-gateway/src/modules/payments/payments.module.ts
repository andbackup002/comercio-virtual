import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { PaymentsController } from './controllers/payments.controller';
import { PaymentsService } from './services/payments.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'PAYMENT_PACKAGE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            url: configService.get('PAYMENT_SERVICE_URL'),
            package: 'payment',
            protoPath: join(__dirname, '../../../proto/payment.proto'),
          },
        }),
      },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}