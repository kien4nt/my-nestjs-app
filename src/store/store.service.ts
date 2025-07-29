import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Store } from './store.entity';
import { StoreRelation } from 'src/common/enums/relations.enum';
import { plainToInstance } from 'class-transformer';
import { StoreRO } from './ro/store.ro';
import { StoreType } from 'src/common/enums/store-type.enum';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
  ) { }


  //Find All Stores
  async findAllStores(storeRelations: StoreRelation[] = []): Promise<StoreRO[]> {
    const stores = await this.fetchAllStores(storeRelations);
    if (!stores || !stores.length) {
      throw new NotFoundException('No stores found.');
    }
    return stores.map(store => this.mapEntityToResponseObject(store));
  }

  async fetchAllStores(storeRelations: StoreRelation[] = []): Promise<Store[]> {
    return await this.storeRepository.find({ relations: storeRelations });
  }

  //Find A Store By its Display Id
  async findStoreByStoreId(
    storeId: string, storeRelations: StoreRelation[] = [StoreRelation.PARENT_GROUP, StoreRelation.CHILD_SHOPS]
  )
  : Promise<StoreRO> {
    const store = await this.fetchStoreByStoreId(storeId, storeRelations);
    if (!store) {
      throw new NotFoundException(`Store ${storeId} not found.`);
    }
    return this.mapEntityToResponseObject(store);
  }

  async fetchStoreByStoreId(storeId: string, storeRelations: StoreRelation[] = []): Promise<Store | null> {
    return await this.storeRepository.findOne({
      where: { storeId },
      relations: storeRelations,
    });
  }


  //Find Stores By a list of storeIds
  async fetchStoresByStoreIdList(storeIdList: string[], storeRelations: StoreRelation[] = []): Promise<Store[]> {
    const stores = await this.storeRepository.find({
      where: {
        storeId: In(storeIdList),
      },
      relations: storeRelations
    });

    if (!stores?.length) {
      throw new NotFoundException(`Found no store from the provided storeIds.`);
    }
    return stores;
  }

  //Find Stores with type 'group'
  async findAllGroups(storeRelations: StoreRelation[] = []): Promise<StoreRO[]> {
    const groups = await this.fetchGroupOnly(storeRelations);
    if (!groups || !groups.length) {
      throw new NotFoundException('No groups found.');
    }
    return groups.map(group => this.mapEntityToResponseObject(group));
  }

  async fetchGroupOnly(storeRelations: StoreRelation[] = []): Promise<Store[]> {
    return await this.storeRepository.find({
      where: { storeType: StoreType.GROUP },
      relations: storeRelations
    });
  }

  //Find Shops Managed By This Group
  async findChildShopsOfThisGroup(
    storeId: string,
    storeRelations: StoreRelation[] = [StoreRelation.PARENT_GROUP])
    : Promise<StoreRO[]> {
    const shops = await this.fetchChildShopsOfThisGroup(storeId, storeRelations);
    if (!shops || !shops.length) {
      throw new NotFoundException(`No shops found for group ${storeId}.`);
    }
    return shops.map(shop => this.mapEntityToResponseObject(shop));
  }

  async fetchChildShopsOfThisGroup(
    storeId: string,
    storeRelations: StoreRelation[] = [StoreRelation.PARENT_GROUP])
    : Promise<Store[]> {
    const group = await this.fetchStoreByStoreId(storeId);
    if (!group || group.storeType !== StoreType.GROUP) {
      throw new BadRequestException(`Store ${storeId} is not an available group.`);
    }
    return await this.storeRepository.find({
      where: { parentGroup: { id: group.id } },
      relations: storeRelations,
    });

  }

  

  mapEntityToResponseObject(store: Store): StoreRO {
    return plainToInstance(
      StoreRO, store,
      {
        excludeExtraneousValues: true,
      }
    );
  }

 

}

