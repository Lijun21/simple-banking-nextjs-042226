import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { NotificationsService } from './notifications.service';

@Processor('email-notifications')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @Process('payment-complete')
  async handlePaymentComplete(job: Job<{ orderId: string }>) {
    this.logger.log(`Sending payment complete emails for order ${job.data.orderId}`);
    await this.notificationsService.sendPaymentCompleteEmails(job.data.orderId);
  }
}
