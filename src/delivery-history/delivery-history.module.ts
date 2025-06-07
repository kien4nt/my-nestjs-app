import { Module } from '@nestjs/common';
import { StoreModule } from './../store/store.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryHistoryService } from './delivery-history.service';
import { DeliveryHistoryController } from './delivery-history.controller';
import { DeliveryHistory } from './delivery-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryHistory])
    , StoreModule],
  controllers: [DeliveryHistoryController],
  providers: [DeliveryHistoryService],
  exports: [DeliveryHistoryService],

})
export class DeliveryHistoryModule { }