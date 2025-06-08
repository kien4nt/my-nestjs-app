import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminDto {
  @ApiProperty({description: 'Name of the admin' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({description: 'Office ID of the admin' })
  @IsString()
  @IsNotEmpty()
  officeId: string;
}
