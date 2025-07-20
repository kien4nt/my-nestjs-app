import { Expose, Transform } from 'class-transformer';
import { StoreType } from 'src/common/enums/store-type.enum';

export class StoreRO {

  @Expose()
  storeId: string;

//   @Expose()
//   storeName: string;

//   @Expose()
//   storeCode: string;


  @Expose()
  storename: string;

  @Expose()
  storeType: StoreType;

  @Expose()
  @Transform(({ obj }) => obj.parentGroup ? obj.parentGroup.storeId : undefined)
  parentGroupStoreId: string;

  @Expose()
  isActive: boolean;
}



