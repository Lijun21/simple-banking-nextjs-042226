import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { PaymentOrder } from '../payment-orders/payment-order.entity';
import { NotificationsService } from './notifications.service';
import { EmailProcessor } from './email.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentOrder]),
    BullModule.registerQueue({ name: 'email-notifications' }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: 'smtp.resend.com',
          port: 465,
          secure: true,
          auth: {
            user: 'resend',
            pass: config.get('RESEND_API_KEY'),
          },
        },
        defaults: {
          from: config.get('EMAIL_FROM') || 'noreply@companyp.com',
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
    }),
  ],
  providers: [NotificationsService, EmailProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
