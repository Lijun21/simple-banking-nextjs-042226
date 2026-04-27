import {
  Controller, Get, Post, Param, Body, Query, UseGuards, Request,
} from '@nestjs/common';
import { PaymentOrdersService } from './payment-orders.service';
import { CreatePaymentOrderDto, PayOrderDto } from './dto/payment-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('payment-orders')
export class PaymentOrdersController {
  constructor(private readonly service: PaymentOrdersService) {}

  @Get()
  findAll(
    @Request() req,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.service.findAll(req.user.id, +page, +pageSize);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.service.findOne(id, req.user.id);
  }

  @Post()
  create(@Body() dto: CreatePaymentOrderDto, @Request() req) {
    return this.service.create(req.user.id, dto);
  }

  @Post(':id/pay')
  pay(@Param('id') id: string, @Body() dto: PayOrderDto, @Request() req) {
    return this.service.pay(id, req.user.id, dto);
  }
}
