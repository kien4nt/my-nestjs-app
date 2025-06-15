import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { DeliveryHistoryService } from './delivery-history.service';
import { CreateDeliveryHistoryDto } from './dto/create-delivery-history.dto';
import { UpdateDeliveryHistoryDto } from './dto/update-delivery-history.dto';
import { DeliveryHistory } from './delivery-history.entity';
import { DeliveryHistoryRO } from './ro/delivery-history.ro';

@ApiTags('delivery-history')
@Controller('delivery-history')
export class DeliveryHistoryController {
  constructor(private readonly deliveryService: DeliveryHistoryService) { }

  @Get(":receiverStoreId")
  @ApiOperation({ summary: "Find all delivery history records of this recevierStore by its storeId" })
  @ApiParam({ name: "receiverStoreId", type: String, description: "storeId of the receiverStore" })
  @ApiResponse({
    status: 200,
    description: "List of delivery history records of the receiverStore",
    type: [DeliveryHistoryRO],
  })
  @ApiResponse({ status: 404, description: "receiverStore not found." })
  async findDeliverHistoryByReceiverStoreId(@Param('receiverStoreId') receiverStoreId: string): Promise<DeliveryHistoryRO[]> {
    return await this.deliveryService.findDeliveryHistoryByReceiverStoreId(receiverStoreId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a delivery history record by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'DeliveryHistory ID' })
  @ApiResponse({ status: 200, description: 'The delivery history was updated.' })
  @ApiResponse({ status: 404, description: 'The delivery history could not be found.' })
  @ApiBody({ type: UpdateDeliveryHistoryDto })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDeliveryHistoryDto) {
    return await this.deliveryService.update(id, dto);
  }

  @Post()
  @ApiOperation({ summary: 'Create delivery history records (sender,receivers)' })
  @ApiResponse({ status: 201, description: 'The delivery history records were successfully created.' })
  @ApiBody({ type: CreateDeliveryHistoryDto })
  async create(@Body() dto: CreateDeliveryHistoryDto) {
    return await this.deliveryService.create(dto);
  }


}
