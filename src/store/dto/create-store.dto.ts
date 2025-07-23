import { IsString, IsIn, IsOptional, IsNumber, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StoreType } from 'src/common/enums/store-type.enum';

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

  @ApiProperty({ example: '1a02d1e7-8f7d-4494-b440-365ff99374d0', description: 'UUID of Admin who manages this store' })
  @IsUUID('4', { message: 'Provided ID is not a valid UUID v4' })
  adminId: string;

  @ApiPropertyOptional({ example: '1a02d1e7-8f7d-4494-b440-365ff99374d0', description: 'Parent group store ID if applicable' })
  @IsUUID('4', { message: 'Provided ID is not a valid UUID v4' })
  @IsOptional()
  parentGroupStoreId?: string;
}
