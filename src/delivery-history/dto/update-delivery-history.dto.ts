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
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ErrorDetail } from '../../common/interfaces/error-detail.interface';

export class UpdateDeliveryHistoryDto {
    @ApiPropertyOptional({
        example: '2025-06-13T09:00:00Z',
        description: 'Updated start datetime of the delivery.'
    })
    @IsOptional()
    @IsDateString()
    startDateTime?: Date;

    @ApiPropertyOptional({
        example: '2025-06-13T11:00:00Z',
        description: 'Updated end datetime of the delivery.'
    })
    @IsOptional()
    @IsDateString()
    endDateTime?: Date;

    @ApiPropertyOptional({
        example: true,
        description: 'Whether the delivery is still in progress (true) or completed (false).'
    })
    @IsOptional()
    @IsBoolean()
    transactionStatus?: boolean;

    @ApiPropertyOptional({
        example: 'send',
        enum: ['send', 'receive'],
        description: 'Type of the delivery transaction.'
    })
    @IsOptional()
    @IsEnum(['send', 'receive'])
    transactionType?: string;

    @ApiPropertyOptional({
        example: '1a02d1e7-8f7d-4494-b440-365ff99374d0',
        description: 'storeId of reciever store'
    })
    @IsOptional()
    @IsUUID()
    receiverStoreId?: string;

    @ApiPropertyOptional({
        example: '1a02d1e7-8f7d-4494-b440-365ff99374d0',
        description: 'storeId of sender store'
    })
    @IsOptional()
    @IsUUID()
    senderStoreId?: string;

    @ApiPropertyOptional({
        example: {
            'a1b2c3': 'Can Tho Store 1',
            'd4e5f6': 'Can Tho Store 2'
        },
        description: 'Updated receiver list if this is a sender delivery.'
    })
    @IsOptional()
    @IsObject()
    receiverList?: object;

    @ApiPropertyOptional({
        example: [
            { errorCode: 'MISSING_DATA', errorMessage: 'Receiver lost package info.' },
        ],
        description: 'Error details if the delivery failed.'
    })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => UpdateErrorDetailDto)
    errors?: UpdateErrorDetailDto[];
} 

export class UpdateErrorDetailDto {
  @ApiPropertyOptional({
    example: 'MISSING_DATA',
    description: "Code of the occured error"
  })
  @IsOptional()
  @IsString()
  errorCode?: string;

  @ApiPropertyOptional({
    example: 'Some data is missing.',
    description: "The human-readable message that describes the error"
  })
  @IsOptional()
  @IsString()
  errorMessage?: string;
}

