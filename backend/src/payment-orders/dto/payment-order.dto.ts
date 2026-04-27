import { IsUUID, IsInt, IsPositive, IsOptional, IsString } from 'class-validator';

export class CreatePaymentOrderDto {
  @IsUUID()
  vendorId: string;

  @IsInt()
  @IsPositive()
  amountCents: number;

  @IsOptional()
  @IsString()
  memo?: string;
}

export class PayOrderDto {
  @IsString()
  stripePaymentMethodId: string;
}
