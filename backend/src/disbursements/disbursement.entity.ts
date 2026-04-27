import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Relation,
} from 'typeorm';
import { Vendor, PaymentMethod } from '../vendors/vendor.entity';

export enum DisbursementStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  SENT = 'sent',
  FAILED = 'failed',
}

@Entity('disbursements')
export class Disbursement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'payment_order_id' })
  paymentOrderId: string;

  @Column({ name: 'vendor_id' })
  vendorId: string;

  @Column({ type: 'enum', enum: PaymentMethod })
  method: PaymentMethod;

  @Column({ name: 'amount_cents' })
  amountCents: number;

  @Column({ name: 'processor_ref', nullable: true })
  processorRef: string;

  @Column({
    type: 'enum',
    enum: DisbursementStatus,
    default: DisbursementStatus.QUEUED,
  })
  status: DisbursementStatus;

  @Column({ name: 'scheduled_at', nullable: true })
  scheduledAt: Date;

  @Column({ name: 'sent_at', nullable: true })
  sentAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Relation<Vendor>;
}
