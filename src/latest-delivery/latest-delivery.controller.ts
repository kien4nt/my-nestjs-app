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
    @ApiResponse({ status: 200, description: 'Delivery can be proceeded.', type: Boolean })
    @ApiResponse({ status: 404, description: 'Delivery should be canceled.', type: Boolean })
    @ApiResponse({ status: 400, description: 'Invalid UUID format.' })
    async checkDeliveryProceedStatus(@Param() dto: UuidDto)
        : Promise<boolean> {
        return await this.LatestDeliveryService.checkDeliverable(dto.uuid);
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
