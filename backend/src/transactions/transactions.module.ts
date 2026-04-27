import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentOrder } from '../payment-orders/payment-order.entity';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentOrder])],
  providers: [TransactionsService],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
