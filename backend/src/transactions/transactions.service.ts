import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentOrder } from '../payment-orders/payment-order.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(PaymentOrder)
    private readonly orderRepo: Repository<PaymentOrder>,
  ) {}

  async findAll(userId: string, page = 1, pageSize = 20) {
    const [data, total] = await this.orderRepo.findAndCount({
      where: { userId },
      relations: ['vendor', 'charge', 'disbursement', 'fee'],
      order: { createdAt: 'DESC' },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });
    return { data, total, page, pageSize };
  }

  async findOne(id: string, userId: string) {
    return this.orderRepo.findOne({
      where: { id, userId },
      relations: ['vendor', 'charge', 'disbursement', 'fee'],
    });
  }
}
