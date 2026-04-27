import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Disbursement, DisbursementStatus } from './disbursement.entity';
import { PaymentOrder, PaymentOrderStatus } from '../payment-orders/payment-order.entity';
import { PaymentMethod } from '../vendors/vendor.entity';

@Injectable()
export class DisbursementsService {
  private readonly logger = new Logger(DisbursementsService.name);

  constructor(
    @InjectRepository(Disbursement)
    private readonly disbursementRepo: Repository<Disbursement>,
    @InjectRepository(PaymentOrder)
    private readonly orderRepo: Repository<PaymentOrder>,
  ) {}

  async createFromOrder(orderId: string): Promise<Disbursement> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['vendor'],
    });

    const disbursement = this.disbursementRepo.create({
      paymentOrderId: order.id,
      vendorId: order.vendorId,
      method: order.vendor.paymentMethod,
      amountCents: order.amountCents,
      status: DisbursementStatus.QUEUED,
      scheduledAt: new Date(),
    });
    return this.disbursementRepo.save(disbursement);
  }

  async markSent(id: string, processorRef: string): Promise<Disbursement> {
    const d = await this.disbursementRepo.findOne({ where: { id } });
    d.status = DisbursementStatus.SENT;
    d.processorRef = processorRef;
    d.sentAt = new Date();
    return this.disbursementRepo.save(d);
  }

  async markFailed(id: string): Promise<Disbursement> {
    const d = await this.disbursementRepo.findOne({ where: { id } });
    d.status = DisbursementStatus.FAILED;
    return this.disbursementRepo.save(d);
  }

  async completeOrder(orderId: string): Promise<void> {
    await this.orderRepo.update(orderId, { status: PaymentOrderStatus.COMPLETED });
  }

  findAll(page = 1, pageSize = 20) {
    return this.disbursementRepo.findAndCount({
      relations: ['vendor', 'paymentOrder'],
      order: { createdAt: 'DESC' },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });
  }
}
