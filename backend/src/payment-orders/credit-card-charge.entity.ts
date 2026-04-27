import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

export enum ChargeStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('credit_card_charges')
export class CreditCardCharge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'payment_order_id' })
  paymentOrderId: string;

  @Column({ name: 'processor_ref', nullable: true })
  processorRef: string;

  @Column({ name: 'amount_cents' })
  amountCents: number;

  @Column({ type: 'enum', enum: ChargeStatus, default: ChargeStatus.PENDING })
  status: ChargeStatus;

  @Column({ name: 'charged_at', nullable: true })
  chargedAt: Date;
}
