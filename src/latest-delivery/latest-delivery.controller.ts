import {
    Controller,
    Get,
    Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { LatestDeliveryService } from './latest-delivery.service';
import { UuidDto } from 'src/common/dtos/uuid.dto';

@ApiTags('latest-delivery')
@Controller('latest-delivery')
export class LatestDeliveryController {
    constructor(
        private readonly LatestDeliveryService: LatestDeliveryService,
    ) { }

    @Get(':uuid/check-delivery-status')
    @ApiOperation({ summary: 'Check if a delivery can be proceeded for a store based on its latest delivery status' })
    @ApiParam({ name: 'uuid', description: 'The display ID of the store', type: String })
    @ApiResponse({ status: 200, description: 'Delivery can be proceeded.', type: String })
    @ApiResponse({ status: 404, description: 'Delivery should be canceled.', type: String })
    @ApiResponse({ status: 400, description: 'Invalid UUID format.' })
    async checkDeliveryProceedStatus(@Param() dto: UuidDto)
        : Promise<string> {
        const deliverable = await this.LatestDeliveryService.checkDeliverable(dto.uuid);
        return deliverable ?
            'Delivery can be proceeded.' :
            'Delivery should be canceled.';
    }

}
