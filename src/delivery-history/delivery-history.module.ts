import { Module } from '@nestjs/common';
import { StoreModule } from './../store/store.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryHistoryService } from './delivery-history.service';
import { DeliveryHistoryController } from './delivery-history.controller';
import { DeliveryHistory } from './delivery-history.entity';
import { LatestDeliveryModule } from 'src/latest-delivery/latest-delivery.module';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryHistory])
    , StoreModule,LatestDeliveryModule],
  controllers: [DeliveryHistoryController],
  providers: [DeliveryHistoryService],
  exports: [DeliveryHistoryService],

})
export class DeliveryHistoryModule { }