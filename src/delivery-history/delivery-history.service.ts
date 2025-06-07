import { StoreService } from '../store/store.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryHistory } from './delivery-history.entity';


@Injectable()
export class DeliveryHistoryService {
  constructor(
    @InjectRepository(DeliveryHistory)
    private deliveryHistoryRepository: Repository<DeliveryHistory>,
    private readonly StoreService: StoreService
  ) { }

}

