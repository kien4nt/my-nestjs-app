import {
    Controller,
    Get,
    Param,
    NotFoundException,
    Put,
    ParseIntPipe,
    Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { LatestDeliveryService } from './latest-delivery.service';
import { LatestDelivery } from '../latest-delivery/latest-delivery.entity';
import { UpsertLatestDeliveryDto } from './dto/upsert-latest-delivery.dto';

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
        return await this.LatestDeliveryService.checkDeliverable(storeId);
    }

    // @Put(':storeIdPK')
    // @ApiOperation({ summary: 'Upsert latest delivery record for a store' })
    // @ApiParam({ name: 'storeIdPK', type: Number, description: 'Store ID (Primary Key)' })
    // @ApiResponse({ status: 200, description: 'Latest delivery record upserted.' })
    // @ApiBody({ type: UpsertLatestDeliveryDto })
    // async upsert(@Param('storeIdPK', ParseIntPipe) storeIdPK: number, @Body() dto: UpsertLatestDeliveryDto) {
    //     return this.LatestDeliveryService.upsertLatest(storeIdPK, dto);
    // }

}
