import { IsString, IsIn, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStoreDto {
  @ApiProperty({ example: 'Main Store', description: 'Name of the store for authentication' })
  @IsString()
  storeName: string;

  @ApiProperty({ example: 'MS001', description: 'Code of the store for authentication' })
  @IsString()
  storeCode: string;

  @ApiProperty({ description: 'Password for the store for authentication' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'Unique store name' })
  @IsString()
  storename: string;

  @ApiProperty({ example: 'shop', enum: ['group', 'shop'], description: 'Type of store' })
  @IsIn(['group', 'shop'])
  storeType: string;

//   @ApiProperty({ example: 1, description: 'Admin ID who manages this store' })
//   @IsNumber()
//   adminId: number;

  @ApiPropertyOptional({ example: 2, description: 'Parent group store ID if applicable' })
  @IsOptional()
  parentGroupId?: number;
}
