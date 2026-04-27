import { IsString, IsEmail, IsEnum, IsOptional, IsObject } from 'class-validator';
import { PaymentMethod } from './vendor.entity';

export class CreateVendorDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsObject()
  bankAccount?: Record<string, any>;

  @IsOptional()
  @IsObject()
  address?: Record<string, any>;
}

export class UpdateVendorDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsObject()
  bankAccount?: Record<string, any>;

  @IsOptional()
  @IsObject()
  address?: Record<string, any>;
}
