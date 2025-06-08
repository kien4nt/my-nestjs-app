import { IsString, IsIn, IsOptional, IsNumber } from 'class-validator';

export class CreateStoreDto {

  @IsString()
  storeName: string;

  @IsString()
  storeCode: string;

  @IsString()
  password: string;

  @IsString()
  storename: string;

  @IsIn(['group', 'shop'])
  storeType: string;

//   // Foreign key: adminId
//   @IsNumber()
//   adminId: number;

  // Foreign key: parentGroupId (optional)
  @IsOptional()
  parentGroupId?: number;
}
