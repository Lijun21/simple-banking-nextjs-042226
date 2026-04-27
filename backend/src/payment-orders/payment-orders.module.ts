import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { PaymentOrder } from './payment-order.entity';
import { CreditCardCharge } from './credit-card-charge.entity';
import { PaymentOrdersService } from './payment-orders.service';
import { PaymentOrdersController } from './payment-orders.controller';
import { VendorsModule } from '../vendors/vendors.module';
import { FeesModule } from '../fees/fees.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentOrder, CreditCardCharge]),
    BullModule.registerQueue({ name: 'disbursements' }),
    VendorsModule,
    FeesModule,
  ],
  providers: [PaymentOrdersService],
  controllers: [PaymentOrdersController],
  exports: [PaymentOrdersService],
})
export class PaymentOrdersModule {}
