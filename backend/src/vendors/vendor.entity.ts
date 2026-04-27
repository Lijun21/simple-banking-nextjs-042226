import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Relation,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum PaymentMethod {
  ACH = 'ach',
  WIRE = 'wire',
  CHECK = 'check',
}

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ name: 'bank_account', type: 'jsonb', nullable: true })
  bankAccount: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  address: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;
}
