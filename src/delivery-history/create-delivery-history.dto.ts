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

export class CreateDeliveryHistoryDto {
  @ApiProperty({
    description: 'The start date and time of the delivery.',
    example: '2023-10-26T10:00:00Z',
    type: String,
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  startDateTime: Date;

  @ApiProperty({
    description: 'The end date and time of the delivery.',
    example: '2023-10-26T11:00:00Z',
    type: String,
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  endDateTime: Date;

  @ApiProperty({
    description: 'The ID of the receiving store (foreign key to Store).',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  receiverId: number;

  @ApiProperty({
    description: 'The ID of the sending store (foreign key to Store).',
    example: 2,
  })
  @IsNotEmpty()
  @IsNumber()
  senderId: number;

  @ApiProperty({
    description: 'The status of the transaction (true for success, false for failure).',
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  transactionStatus: boolean;

  @ApiProperty({
    description: 'The type of transaction (send or receive).',
    enum: TransactionType,
    example: TransactionType.SEND,
  })
  @IsNotEmpty()
  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @ApiProperty({
    description: 'A JSON object containing details of receivers.',
    example: { user1: 'itemA', user2: 'itemB' },
    type: Object,
    required: false, // Marking as optional in DTO based on common use cases for JSONB
  })
  @IsObject()
  @IsNotEmptyObject()
  receiverList: object;

  @ApiProperty({
    description: 'An optional error message if the transaction failed.',
    example: 'Item out of stock.',
    required: false,
  })
  @IsOptional()
  @IsString()
  errorMessage: string;
}