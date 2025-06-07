import { Module } from '@nestjs/common';
import { StoreModule } from './../store/store.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LatestDeliveryController } from './latest-delivery.controller';
import { LatestDeliveryService } from './latest-delivery.service';
import { LatestDelivery } from '../latest-delivery/latest-delivery.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LatestDelivery])
    , StoreModule],
  controllers: [LatestDeliveryController],
  providers: [LatestDeliveryService],
  exports: [LatestDeliveryService],
})
export class LatestDeliveryModule {}
