import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { PaymentOrder, PaymentOrderStatus } from './payment-order.entity';
import { CreditCardCharge, ChargeStatus } from './credit-card-charge.entity';
import { CreatePaymentOrderDto, PayOrderDto } from './dto/payment-order.dto';
import { VendorsService } from '../vendors/vendors.service';
import { FeeCalculatorService } from '../fees/fee-calculator.service';

@Injectable()
export class PaymentOrdersService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(PaymentOrder)
    private readonly orderRepo: Repository<PaymentOrder>,
    @InjectRepository(CreditCardCharge)
    private readonly chargeRepo: Repository<CreditCardCharge>,
    @InjectQueue('disbursements')
    private readonly disbursementQueue: Queue,
    private readonly vendorsService: VendorsService,
    private readonly feeCalculator: FeeCalculatorService,
    private readonly config: ConfigService,
  ) {
    this.stripe = new Stripe(this.config.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-06-20',
    });
  }

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

  async findOne(id: string, userId: string): Promise<PaymentOrder> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['vendor', 'charge', 'disbursement', 'fee'],
    });
    if (!order) throw new NotFoundException('Payment order not found');
    if (order.userId !== userId) throw new ForbiddenException();
    return order;
  }

  async create(userId: string, dto: CreatePaymentOrderDto): Promise<PaymentOrder> {
    // verify vendor belongs to user
    await this.vendorsService.findOne(dto.vendorId, userId);

    const feeCents = this.feeCalculator.calculateFeeAmountCents(dto.amountCents);
    const totalCents = dto.amountCents + feeCents;

    const order = this.orderRepo.create({
      userId,
      vendorId: dto.vendorId,
      amountCents: dto.amountCents,
      feeCents,
      totalCents,
      memo: dto.memo,
      status: PaymentOrderStatus.PENDING,
    });
    return this.orderRepo.save(order);
  }

  async pay(id: string, userId: string, dto: PayOrderDto): Promise<PaymentOrder> {
    const order = await this.findOne(id, userId);

    if (order.status !== PaymentOrderStatus.PENDING) {
      throw new BadRequestException('Order is not in pending state');
    }

    // Create charge record
    const charge = this.chargeRepo.create({
      paymentOrderId: order.id,
      amountCents: order.totalCents,
      status: ChargeStatus.PENDING,
    });
    await this.chargeRepo.save(charge);

    // Update order status
    order.status = PaymentOrderStatus.PROCESSING;
    await this.orderRepo.save(order);

    try {
      // Charge via Stripe
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: order.totalCents,
        currency: 'usd',
        payment_method: dto.stripePaymentMethodId,
        confirm: true,
        automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
        metadata: { orderId: order.id },
      });

      charge.processorRef = paymentIntent.id;
      charge.status = ChargeStatus.SUCCEEDED;
      charge.chargedAt = new Date();
      await this.chargeRepo.save(charge);

      // Create fee record
      await this.feeCalculator.createFee(order.id, order.amountCents);

      // Enqueue disbursement
      await this.disbursementQueue.add('process', { orderId: order.id });

      return order;
    } catch (err) {
      charge.status = ChargeStatus.FAILED;
      await this.chargeRepo.save(charge);
      order.status = PaymentOrderStatus.FAILED;
      await this.orderRepo.save(order);
      throw new BadRequestException(`Payment failed: ${err.message}`);
    }
  }
}
