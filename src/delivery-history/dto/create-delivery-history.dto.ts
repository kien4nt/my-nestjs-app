import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  ArrayUnique,
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
  @IsUUID('4')
  senderStoreId: string;

  @ApiPropertyOptional({ example: '1a02d1e7-8f7d-4494-b440-365ff99374d0', description: 'storeId of the receiver store (optional)' })
  @IsOptional()
  @IsUUID('4')
  receiverStoreId?: string;

  @ApiProperty({ example: true, description: 'Status of the transaction (true = in progress, false = completed)' })
  @IsBoolean()
  transactionStatus: boolean;

  @ApiProperty({ enum: ['send', 'receive'], description: 'Type of transaction' })
  @IsEnum(['send', 'receive'])
  transactionType: string;

  @ApiProperty({
    example: ['1a02d1e7-8f7d-4494-b440-365ff99374d0', '2b03e2f8-9g8e-5505-c551-476gg00485e1'],
    required: true,
    description: 'List of receiver UUIDs for sending transaction',
  })
  @IsUUID('4',{each:true})
  @ArrayNotEmpty({ message: 'receiverList cannot be empty' })
  @ArrayUnique({ message: 'receiverList must contain unique UUIDs' })
  @Type(() => String)
  receiverList: string[];

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

