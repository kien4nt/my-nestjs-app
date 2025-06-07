import { Test, TestingModule } from '@nestjs/testing';
import { LatestDeliveryService } from './latest-delivery.service';

describe('LatestDeliveryService', () => {
  let service: LatestDeliveryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LatestDeliveryService],
    }).compile();

    service = module.get<LatestDeliveryService>(LatestDeliveryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
