import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryHistoryService } from './delivery-history.service';

describe('DeliveryHistoryService', () => {
  let service: DeliveryHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeliveryHistoryService],
    }).compile();

    service = module.get<DeliveryHistoryService>(DeliveryHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

