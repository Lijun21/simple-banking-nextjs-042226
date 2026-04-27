import { FeeCalculatorService } from './fee-calculator.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Fee } from './fee.entity';

describe('FeeCalculatorService', () => {
  let service: FeeCalculatorService;
  const mockRepo = { create: jest.fn(), save: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeeCalculatorService,
        { provide: getRepositoryToken(Fee), useValue: mockRepo },
      ],
    }).compile();
    service = module.get<FeeCalculatorService>(FeeCalculatorService);
  });

  it('applies 2.9% rate for amounts up to $2,000', () => {
    expect(service.calculateFeeAmountCents(100_00)).toBe(29_0); // $100 → $2.90
    expect(service.calculateFeeAmountCents(1000_00)).toBe(290_0); // $1,000 → $29
  });

  it('applies 2.5% rate for amounts $2,001–$10,000', () => {
    expect(service.calculateFeeAmountCents(5000_00)).toBe(1250_0); // $5,000 → $125
  });

  it('applies 2.0% rate for amounts above $10,000', () => {
    expect(service.calculateFeeAmountCents(20000_00)).toBe(4000_0); // $20,000 → $400
  });

  it('creates and saves a fee record', async () => {
    const mockFee = { id: 'fee-1' };
    mockRepo.create.mockReturnValue(mockFee);
    mockRepo.save.mockResolvedValue(mockFee);

    const result = await service.createFee('order-1', 100_00);
    expect(mockRepo.create).toHaveBeenCalled();
    expect(result).toEqual(mockFee);
  });
});
