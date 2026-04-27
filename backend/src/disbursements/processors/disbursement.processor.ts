import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { DisbursementsService } from '../disbursements.service';
import { PaymentMethod } from '../../vendors/vendor.entity';

@Processor('disbursements')
export class DisbursementProcessor {
  private readonly logger = new Logger(DisbursementProcessor.name);

  constructor(
    private readonly disbursementsService: DisbursementsService,
    @InjectQueue('email-notifications')
    private readonly emailQueue: Queue,
  ) {}

  @Process('process')
  async handleDisbursement(job: Job<{ orderId: string }>) {
    const { orderId } = job.data;
    this.logger.log(`Processing disbursement for order ${orderId}`);

    const disbursement = await this.disbursementsService.createFromOrder(orderId);

    try {
      disbursement.status = 'processing' as any;
      await this.disbursementsService['disbursementRepo'].save(disbursement);

      const ref = await this.sendToProcessor(disbursement.method, disbursement);
      await this.disbursementsService.markSent(disbursement.id, ref);
      await this.disbursementsService.completeOrder(orderId);

      // Enqueue notification emails
      await this.emailQueue.add('payment-complete', { orderId }, { attempts: 3, backoff: { type: 'exponential', delay: 5000 } });

      this.logger.log(`Disbursement ${disbursement.id} sent successfully`);
    } catch (err) {
      this.logger.error(`Disbursement failed for order ${orderId}: ${err.message}`);
      await this.disbursementsService.markFailed(disbursement.id);
      throw err; // triggers BullMQ retry
    }
  }

  private async sendToProcessor(method: PaymentMethod, disbursement: any): Promise<string> {
    // Simulate external processor call (Dwolla / check issuer etc.)
    await new Promise((r) => setTimeout(r, 100));
    return `ref-${method}-${Date.now()}`;
  }
}
