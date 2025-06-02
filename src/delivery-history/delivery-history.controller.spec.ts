import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryHistoryController } from './delivery-history.controller';

describe('DeliveryHistoryController', () => {
  let controller: DeliveryHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryHistoryController],
    }).compile();

    controller = module.get<DeliveryHistoryController>(DeliveryHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
