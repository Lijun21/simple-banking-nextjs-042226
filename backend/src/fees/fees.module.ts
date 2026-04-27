import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fee } from './fee.entity';
import { FeeCalculatorService } from './fee-calculator.service';

@Module({
  imports: [TypeOrmModule.forFeature([Fee])],
  providers: [FeeCalculatorService],
  exports: [FeeCalculatorService],
})
export class FeesModule {}
