import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDeliveryHistoryDto {
  

  @ApiProperty({ example: '1a02d1e7-8f7d-4494-b440-365ff99374d0', description: 'storeId of the sender store' })
  @IsUUID('4')
  senderStoreId: string;

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

  
}




