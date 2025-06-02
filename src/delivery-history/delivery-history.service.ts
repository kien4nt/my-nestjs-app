import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryHistory } from './delivery-history.entity'; 
import { LatestDelivery } from './latest-delivery.entity'; 


@Injectable()
export class DeliveryHistoryService {
  constructor(
    @InjectRepository(DeliveryHistory)
    private deliveryHistoryRepository: Repository<DeliveryHistory>,
    @InjectRepository(LatestDelivery)
    private latestDeliveryRepository: Repository<LatestDelivery>,
  ) {}

  async findLatestDeliveryOfThisStore(storeIdPK: number): Promise<LatestDelivery | null>{

    const latestDelivery = await this.latestDeliveryRepository.findOne({
      where: { store: { id: storeIdPK } },
      relations: ['store'],
    });
    return latestDelivery;
  }

  async checkDeliverable(storeIdPK: number): Promise<boolean> {
    const latestDelivery = await this.findLatestDeliveryOfThisStore(storeIdPK);

    // NO RECORD IN HISTORY -> DELIVERABLE
    if (latestDelivery === null) {
      return true;
    }

    // TRANSACTION IN-PROCESS -> NOT DELIVERABLE
    if(latestDelivery.transactionStatus === true){
      return false;
    }
    // TRANSACTION COMPLETED -> DELIVERABLE
    else if(latestDelivery.transactionStatus === false){
      return true;
    }
    // UNEXPECTED ERROR -> NOT DELIVERABLE
    return false;
 
  }

   


}

