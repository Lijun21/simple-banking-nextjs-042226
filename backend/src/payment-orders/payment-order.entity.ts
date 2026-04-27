import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, OneToOne, Relation,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Vendor } from '../vendors/vendor.entity';
import { CreditCardCharge } from './credit-card-charge.entity';
import { Fee } from '../fees/fee.entity';
import { Disbursement } from '../disbursements/disbursement.entity';

export enum PaymentOrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('payment_orders')
export class PaymentOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'vendor_id' })
  vendorId: string;

  @Column({ name: 'amount_cents' })
  amountCents: number;

  @Column({ name: 'fee_cents', default: 0 })
  feeCents: number;

  @Column({ name: 'total_cents', default: 0 })
  totalCents: number;

  @Column({
    type: 'enum',
    enum: PaymentOrderStatus,
    default: PaymentOrderStatus.PENDING,
  })
  status: PaymentOrderStatus;

  @Column({ nullable: true })
  memo: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Relation<Vendor>;

  @OneToOne(() => CreditCardCharge)
  @JoinColumn()
  charge: Relation<CreditCardCharge>;

  @OneToOne(() => Disbursement)
  @JoinColumn()
  disbursement: Relation<Disbursement>;

  @OneToOne(() => Fee)
  @JoinColumn()
  fee: Relation<Fee>;
}
