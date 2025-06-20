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
    @IsUUID('4')
    receiverStoreId?: string;

    @ApiPropertyOptional({
        example: '1a02d1e7-8f7d-4494-b440-365ff99374d0',
        description: 'storeId of sender store'
    })
    @IsOptional()
    @IsUUID('4')
    senderStoreId?: string;


    @ApiPropertyOptional({
        example: ['1a02d1e7-8f7d-4494-b440-365ff99374d0', '2b03e2f8-9g8e-5505-c551-476gg00485e1'],
        required: false,
        description: 'List of receiver UUIDs for sending transaction',
    })
    @IsOptional()
    @IsUUID('4', { each: true })
    @Type(() => String)
    receiverList?: string[];

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

