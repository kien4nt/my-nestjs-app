import {
    Controller,
    Get,
    Param,
    NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DeliveryHistoryService } from './delivery-history.service';
import { DeliveryHistory } from './delivery-history.entity';
import { LatestDelivery } from './latest-delivery.entity';
import {StoreService} from '../store/store.service'

@ApiTags('delivery-history')
@Controller('delivery-history')
export class DeliveryHistoryController {
    constructor(
        private readonly DeliveryHistoryService: DeliveryHistoryService,
        private readonly StoreService: StoreService,
    ) {}
        
@Get(':storeDisplayId/check-delivery-status')
  @ApiOperation({ summary: 'Check if a delivery can be proceeded for a store based on its latest delivery status' })
  @ApiParam({ name: 'storeDisplayId', description: 'The display ID of the store', type: String })
  @ApiResponse({ status: 200, description: 'Delivery can be proceeded.', type: Boolean })
  @ApiResponse({ status: 404, description: 'Delivery should be canceled.', type: Boolean  })
  async checkDeliveryProceedStatus(@Param('storeDisplayId') storeDisplayId: string)
  : Promise<boolean> {
     const store = await this.StoreService.findStoreByDisplayId(storeDisplayId);
     if(!store) {
        throw new NotFoundException(`Store ${storeDisplayId} not found`)
     }
    
     return this.DeliveryHistoryService.checkDeliverable(store.id);
  }

}
