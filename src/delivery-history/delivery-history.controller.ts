import {
    Controller,
    Get,
    Param,
    NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DeliveryHistoryService } from './delivery-history.service';
import { DeliveryHistory } from './delivery-history.entity';

@ApiTags('delivery-history')
@Controller('delivery-history')
export class DeliveryHistoryController {
    constructor(
        private readonly DeliveryHistoryService: DeliveryHistoryService,
    ) { }


}
