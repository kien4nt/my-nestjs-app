import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UuidDto {
    constructor(uuid: string) {
        this.uuid = uuid;
    }

    @ApiProperty({
        example: '1a02d1e7-8f7d-4494-b440-365ff99374d0',
        description: 'A valid UUID identifier',
    })
    @IsUUID('4', { message: 'Provided ID is not a valid UUID v4' })
    uuid: string;
}