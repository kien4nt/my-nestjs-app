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
  @Transform(({ obj }) => obj.childShops && obj.childShops.length ? obj.childShops.map(shop => shop.storeId) : undefined)
  childShopStoreIds: string[];

  @Expose()
  @Transform(({ obj }) => obj.admin ? obj.admin.adminId : undefined)
  adminId: string;

  @Expose()
  isActive: boolean;
}



