import { StoreModule } from './../store/store.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryHistoryService } from './delivery-history.service'; 
import { DeliveryHistoryController } from './delivery-history.controller'; 
import { DeliveryHistory } from './delivery-history.entity'; 
import { LatestDelivery } from './latest-delivery.entity'; 

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryHistory, LatestDelivery])
  ,StoreModule],
  controllers: [DeliveryHistoryController],
  providers: [DeliveryHistoryService],
  exports: [DeliveryHistoryService],
  
})
export class DeliveryHistoryModule {}