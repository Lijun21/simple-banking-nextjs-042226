import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { PaymentOrder } from '../payment-orders/payment-order.entity';

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

function settlementDate(method: string): string {
  const days = method === 'ach' ? 3 : method === 'wire' ? 1 : 7;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly mailerService: MailerService,
    @InjectRepository(PaymentOrder)
    private readonly orderRepo: Repository<PaymentOrder>,
  ) {}

  async sendPaymentCompleteEmails(orderId: string): Promise<void> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['user', 'vendor', 'fee'],
    });

    if (!order) {
      this.logger.warn(`Order ${orderId} not found for email notification`);
      return;
    }

    const date = new Date(order.updatedAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    // Customer email
    await this.mailerService.sendMail({
      to: order.user.email,
      subject: `Payment Confirmation #${order.id.slice(0, 8).toUpperCase()}`,
      template: 'payment-complete-customer',
      context: {
        customerName: order.user.companyName,
        vendorName: order.vendor.name,
        orderId: order.id.slice(0, 8).toUpperCase(),
        amountFormatted: formatCents(order.amountCents),
        feeFormatted: formatCents(order.feeCents),
        totalFormatted: formatCents(order.totalCents),
        date,
        memo: order.memo,
      },
    });

    // Vendor email
    await this.mailerService.sendMail({
      to: order.vendor.email,
      subject: `Payment Received from ${order.user.companyName}`,
      template: 'payment-complete-vendor',
      context: {
        vendorName: order.vendor.name,
        customerCompany: order.user.companyName,
        orderId: order.id.slice(0, 8).toUpperCase(),
        amountFormatted: formatCents(order.amountCents),
        paymentMethod: order.vendor.paymentMethod.toUpperCase(),
        settlementDate: settlementDate(order.vendor.paymentMethod),
        memo: order.memo,
      },
    });

    this.logger.log(`Sent payment complete emails for order ${orderId}`);
  }
}
