import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsDateString,
  IsBoolean,
  IsString,
  IsEnum,
  IsObject,
  IsNotEmptyObject,
} from 'class-validator';


enum TransactionType {
  SEND = 'send',
  RECEIVE = 'receive',
}

export class UpdateLatestDeliveryDto {
  @ApiProperty({
    description: 'The new start date and time for the latest delivery.',
    example: '2023-10-26T10:30:00Z',
    type: String,
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDateTime?: Date; // Now optional and updatable

  @ApiProperty({
    description: 'The new end date and time of the latest delivery.',
    example: '2023-10-26T12:30:00Z',
    type: String,
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDateTime?: Date;

  @ApiProperty({
    description: 'The new type of transaction (send or receive).',
    enum: TransactionType,
    example: TransactionType.SEND,
    required: false,
  })
  @IsOptional()
  @IsEnum(TransactionType)
  transactionType?: TransactionType;

  @ApiProperty({
    description: 'The new status of the transaction (true for success, false for failure).',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  transactionStatus?: boolean;

  @ApiProperty({
    description: 'A new JSON object containing details of receivers for the latest delivery.',
    example: { userA: 'new_itemX' },
    type: Object,
    required: true,
  })
  @IsObject()
  @IsNotEmptyObject()
  receiverList?: object;

  @ApiProperty({
    description: 'A new optional error message for the latest delivery if it failed.',
    example: 'New error: Service temporarily down.',
    required: false,
  })
  @IsOptional()
  @IsString()
  errorMessage?: string;
}