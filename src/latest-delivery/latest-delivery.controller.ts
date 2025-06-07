import {
    Controller,
    Get,
    Param,
    NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { LatestDeliveryService } from './latest-delivery.service';
import { LatestDelivery } from '../latest-delivery/latest-delivery.entity';

@ApiTags('latest-delivery')
@Controller('latest-delivery')
export class LatestDeliveryController {
    constructor(
        private readonly LatestDeliveryService: LatestDeliveryService,
    ) { }

    @Get(':storeId/check-delivery-status')
    @ApiOperation({ summary: 'Check if a delivery can be proceeded for a store based on its latest delivery status' })
    @ApiParam({ name: 'storeId', description: 'The display ID of the store', type: String })
    @ApiResponse({ status: 200, description: 'Delivery can be proceeded.', type: Boolean })
    @ApiResponse({ status: 404, description: 'Delivery should be canceled.', type: Boolean })
    async checkDeliveryProceedStatus(@Param('storeId') storeId: string)
        : Promise<boolean> {
        return this.LatestDeliveryService.checkDeliverable(storeId);
    }

}
