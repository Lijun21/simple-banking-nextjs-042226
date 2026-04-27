import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Disbursement } from './disbursement.entity';
import { PaymentOrder } from '../payment-orders/payment-order.entity';
import { DisbursementsService } from './disbursements.service';
import { DisbursementProcessor } from './processors/disbursement.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Disbursement, PaymentOrder]),
    BullModule.registerQueue(
      { name: 'disbursements' },
      { name: 'email-notifications' },
    ),
  ],
  providers: [DisbursementsService, DisbursementProcessor],
  exports: [DisbursementsService],
})
export class DisbursementsModule {}
