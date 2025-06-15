import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { ErrorDetail } from '../../common/interfaces/error-detail.interface';

export class UpsertLatestDeliveryDto {
  // @ApiProperty({ example: '1a02d1e7-8f7d-4494-b440-365ff99374d0', description: 'storeId of the store (store.storeId)' })
  // @IsNumber()
  // storeId: string;

  @ApiPropertyOptional({ example: '2025-06-13T10:00:00.000Z', description: 'Start time of the latest delivery' })
  @IsDateString()
  startDateTime?: Date;

  @ApiPropertyOptional({ example: '2025-06-13T12:00:00.000Z', description: 'End time of the latest delivery' })
  @IsDateString()
  endDateTime?: Date;

  @ApiProperty({ enum: ['send', 'receive'], description: 'Type of transaction (send or receive)' })
  @IsEnum(['send', 'receive'])
  transactionType: string;

  @ApiProperty({ example: true, description: 'Status of the transaction (true = in progress, false = completed)' })
  @IsBoolean()
  transactionStatus: boolean;

  @ApiPropertyOptional({ example: { 'store-1': 'Store A' }, required: false, description: 'List of receivers for sending transaction' })
  @IsOptional()
  @IsObject()
  receiverList?: object;

  @ApiPropertyOptional({
    example: [{ errorCode: 'TIMEOUT', errorMessage: 'Sender timed out.' }],
    description: 'Optional list of error details'
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Object)
  errors?: ErrorDetail[];
}
