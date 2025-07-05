import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsUUID, IsInt, Min, IsOptional } from 'class-validator';

export class FindDeliveryHistoryDto {
    @ApiProperty({
        example: '1a02d1e7-8f7d-4494-b440-365ff99374d0',
        description: 'A valid UUID identifier',
    })
    @IsUUID('4', { message: 'Provided ID is not a valid UUID v4' })
    receiverStoreId: string;

    @ApiPropertyOptional(
    )
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageSize?: number = 50;
}
