import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { ErrorDetail } from '../../common/interfaces/error-detail.interface';

export class CreateDeliveryHistoryDto {
  @ApiPropertyOptional({ example: '2025-06-13T10:00:00.000Z', description: 'Start time of the delivery' })
  @IsOptional()
  @IsDateString()
  startDateTime?: Date;

  @ApiPropertyOptional({ example: '2025-06-13T12:00:00.000Z', description: 'End time of the delivery' })
  @IsOptional()
  @IsDateString()
  endDateTime?: Date;

  @ApiProperty({ example: '1a02d1e7-8f7d-4494-b440-365ff99374d0', description: 'storeId of the sender store' })
  @IsUUID()
  senderStoreId: string;

  @ApiProperty({ example: '1a02d1e7-8f7d-4494-b440-365ff99374d0', description: 'storeId of the receiver store (optional)' })
  @IsOptional()
  @IsUUID()
  receiverStoreId?: string;

  @ApiProperty({ example: true, description: 'Status of the transaction (true = in progress, false = completed)' })
  @IsBoolean()
  transactionStatus: boolean;

  @ApiProperty({ enum: ['send', 'receive'], description: 'Type of transaction' })
  @IsEnum(['send', 'receive'])
  transactionType: string;

  @ApiProperty({ example: { '1a02d1e7-8f7d-4494-b440-365ff99374d0': 'ABC Shop' }, required: false, description: 'List of receivers for sending transaction' })
  @IsOptional()
  @IsObject()
  receiverList?: object;

  @ApiProperty({
    example: [{ errorCode: 'MISSING_DATA', errorMessage: 'Some data is missing.' }],
    description: 'Optional list of error details'
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateErrorDetailDto)
  errors?: CreateErrorDetailDto[];
}



export class CreateErrorDetailDto {
  @ApiProperty({
    example: 'MISSING_DATA',
    description: "Code of the occured error"
  })
  @IsString()
  errorCode: string;

  @ApiProperty({
    example: 'Some data is missing.',
    description: "The human-readable message that describes the error"
  })
  @IsString()
  errorMessage: string;
}

