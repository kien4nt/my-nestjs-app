import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsString,
  IsEnum,
  IsOptional,
  IsObject,
  IsNotEmptyObject,
} from 'class-validator';

// Define the allowed transaction types
enum TransactionType {
  SEND = 'send',
  RECEIVE = 'receive',
}

export class CreateLatestDeliveryDto {
  @ApiProperty({
    description: 'The ID of the store this latest delivery record belongs to (primary key and foreign key).',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  storeIdPK: number;

  @ApiProperty({
    description: 'The start date and time of the latest delivery (part of composite primary key).',
    example: '2023-10-26T10:00:00Z',
    type: String,
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  startDateTime: Date;

  @ApiProperty({
    description: 'The end date and time of the latest delivery.',
    example: '2023-10-26T11:00:00Z',
    type: String,
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  endDateTime: Date;

  @ApiProperty({
    description: 'The type of transaction (send or receive).',
    enum: TransactionType,
    example: TransactionType.RECEIVE,
  })
  @IsNotEmpty()
  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @ApiProperty({
    description: 'The status of the transaction (true for success, false for failure).',
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  transactionStatus: boolean;

  @ApiProperty({
    description: 'A JSON object containing details of receivers for the latest delivery.',
    example: { customerId: 'order123' },
    type: Object,
    required: true,
  })
  @IsObject()
  @IsNotEmptyObject()
  receiverList: object;

  @ApiProperty({
    description: 'An optional error message for the latest delivery if it failed.',
    example: 'Delivery route unavailable.',
    required: false,
  })
  @IsOptional()
  @IsString()
  errorMessage: string;
}