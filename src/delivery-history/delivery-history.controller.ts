import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  ParseIntPipe,
  ParseUUIDPipe,
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

  @Get("receiving/:receiverStoreId")
  @ApiOperation({ summary: "Find all receiving records of this recevierStore by its storeId" })
  @ApiParam({
    name: "receiverStoreId",
    type: String,
    format: "UUID",
    description: "storeId of the receiverStore"
  })
  @ApiResponse({
    status: 200,
    description: "List of receiving records of the receiverStore",
    type: [DeliveryHistoryRO],
  })
  @ApiResponse({ status: 404, description: "receiverStore not found." })
  async findReceiverHistoryByReceiverStoreId(
    @Param('receiverStoreId', new ParseUUIDPipe({ version: '4' })) receiverStoreId: string)
    : Promise<DeliveryHistoryRO[]> {
    return await this.deliveryService.findReceivingHistoryByReceiverStoreId(receiverStoreId);
  }




  @Get('sending/:receiverStoreId')
  @ApiOperation({ summary: "Find all sending records to this receiverStore by its storeId" })
  @ApiParam({
    name: "receiverStoreId",
    type: String,
    format: "UUID",
    description: "storeId of the receiverStore"
  })
  @ApiResponse({
    status: 200,
    description: "List of sending records to the receiverStore",
    type: [DeliveryHistoryRO],
  })
  @ApiResponse({ status: 404, description: "receiverStore not found." })
  async findSenderHistoryByReceiverStoreId(
    @Param('receiverStoreId', new ParseUUIDPipe({ version: '4' })) receiverStoreId: string)
    : Promise<DeliveryHistoryRO[]> {
    return await this.deliveryService.findSendingHistoryByReceiverStoreId(receiverStoreId);
  }

  @Post('create')
  @ApiOperation({ summary: 'Create delivery history records (sender,receivers)' })
  @ApiResponse({ status: 201, description: 'The delivery history records were successfully created.' })
  @ApiBody({ type: CreateDeliveryHistoryDto })
  async create(@Body() dto: CreateDeliveryHistoryDto) {
    return await this.deliveryService.create(dto);
  }

  @Post('deliver')
  @ApiOperation({ summary: 'Deliver assets from sender to receivers and create delivery history records' })
  @ApiResponse({
    status: 201
    , description: 'The delivery has been completed successfully and history records were successfully created.'
  })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ type: CreateDeliveryHistoryDto })
  async deliver(@Body() dto: CreateDeliveryHistoryDto) {
    return await this.deliveryService.deliver(dto);
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



}
