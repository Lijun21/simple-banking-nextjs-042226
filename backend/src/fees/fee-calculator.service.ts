import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fee, FeeType } from './fee.entity';

const FEE_TIERS = [
  { maxCents: 200_000, rate: 0.029 },   // up to $2,000 → 2.9%
  { maxCents: 1_000_000, rate: 0.025 }, // up to $10,000 → 2.5%
  { maxCents: Infinity, rate: 0.02 },   // above $10,000 → 2.0%
];

@Injectable()
export class FeeCalculatorService {
  constructor(
    @InjectRepository(Fee)
    private readonly feeRepo: Repository<Fee>,
  ) {}

  calculateFeeAmountCents(amountCents: number): number {
    const tier = FEE_TIERS.find((t) => amountCents <= t.maxCents);
    return Math.round(amountCents * tier.rate);
  }

  getFeeRate(amountCents: number): number {
    return FEE_TIERS.find((t) => amountCents <= t.maxCents).rate;
  }

  async createFee(paymentOrderId: string, amountCents: number): Promise<Fee> {
    const rate = this.getFeeRate(amountCents);
    const feeCents = this.calculateFeeAmountCents(amountCents);
    const fee = this.feeRepo.create({
      paymentOrderId,
      feeType: FeeType.PERCENTAGE,
      rate,
      amountCents: feeCents,
    });
    return this.feeRepo.save(fee);
  }
}
