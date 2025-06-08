import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAdminDto {
  @ApiPropertyOptional({ description: 'Name of the admin' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({description: 'Office ID of the admin' })
  @IsString()
  @IsOptional()
  officeId?: string;
}
