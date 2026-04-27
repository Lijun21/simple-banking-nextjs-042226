// ── Enums ──────────────────────────────────────────────

export type UserRole = 'customer' | 'admin';
export type PaymentMethod = 'ach' | 'wire' | 'check';
export type PaymentOrderStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ChargeStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';
export type DisbursementStatus = 'queued' | 'processing' | 'sent' | 'failed';

// ── Core Entities ──────────────────────────────────────

export interface User {
  id: string;
  email: string;
  companyName: string;
  role: UserRole;
  createdAt: string;
}

export interface Vendor {
  id: string;
  userId: string;
  name: string;
  email: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface CreditCardCharge {
  id: string;
  paymentOrderId: string;
  processorRef: string;
  amountCents: number;
  status: ChargeStatus;
  chargedAt: string;
}

export interface Disbursement {
  id: string;
  paymentOrderId: string;
  vendorId: string;
  method: PaymentMethod;
  amountCents: number;
  processorRef?: string;
  status: DisbursementStatus;
  scheduledAt?: string;
  sentAt?: string;
}

export interface Fee {
  id: string;
  paymentOrderId: string;
  feeType: 'percentage' | 'flat';
  rate: number;
  amountCents: number;
}

export interface PaymentOrder {
  id: string;
  userId: string;
  vendorId: string;
  vendor?: Vendor;
  amountCents: number;
  feeCents: number;
  totalCents: number;
  status: PaymentOrderStatus;
  memo?: string;
  createdAt: string;
  updatedAt: string;
  creditCardCharge?: CreditCardCharge;
  disbursement?: Disbursement;
  fee?: Fee;
}

// ── API shapes ─────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface CreateVendorInput {
  name: string;
  email: string;
  paymentMethod: PaymentMethod;
  bankAccount?: Record<string, unknown>;
  address?: Record<string, unknown>;
}

export interface CreatePaymentOrderInput {
  vendorId: string;
  amountCents: number;
  memo?: string;
}

export interface PayOrderInput {
  stripePaymentMethodId: string;
}
