// Transactions are served via GET /payment-orders and GET /payment-orders/:id.
// This controller is intentionally empty — kept as a placeholder for future
// admin/reporting endpoints that may need different access rules.
import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {}
