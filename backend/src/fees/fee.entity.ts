import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

export enum FeeType {
  PERCENTAGE = 'percentage',
  FLAT = 'flat',
}

@Entity('fees')
export class Fee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'payment_order_id' })
  paymentOrderId: string;

  @Column({ name: 'fee_type', type: 'enum', enum: FeeType })
  feeType: FeeType;

  @Column({ type: 'decimal', precision: 10, scale: 6 })
  rate: number;

  @Column({ name: 'amount_cents' })
  amountCents: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
