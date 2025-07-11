import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Store } from './store.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { v4 as uuidv4 } from 'uuid';
import { isUUID } from 'class-validator';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
  ) { }


  //Find All Stores
  async findAllStores(): Promise<Store[]> {
    return await this.storeRepository.find();
  }


  //Find A Store By its Display Id
  async findStoreByStoreId(storeId: string): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { storeId },
      relations: ['admin', 'latestDelivery', 'parentGroup', 'childShops'],
    });
    if (!store) {
      throw new NotFoundException(`Store ${storeId} not found.`);
    }
    return store;
  }


   //Find Stores By a list of storeIds
  async findStoresByStoreIdList(storeIdList: string[]): Promise<Store[]> {
    const stores = await this.storeRepository.find({
        where: {
          storeId: In(storeIdList),
        },
        relations: ["latestDelivery"]
      });

    if (!stores?.length) {
      throw new NotFoundException(`Found no store from the provided storeIds.`);
    }
    return stores;
  }

  //Find Stores with type 'group'
  async filterGroupOnlyList(): Promise<Store[]> {
    return await this.storeRepository.find({
      where: { storeType: 'group' }
    });
  }

  //Find Shops Managed By This Group
  async findChildShopsOfThisGroup(storeId: string): Promise<Store[]> {
    const group = await this.findStoreByStoreId(storeId);
    return await this.storeRepository.find({
      where: { parentGroup: { id: group.id } },
      relations: ['parentGroup'],
    });
  }

  //Find Stores Under The Same Admin As This Group
  async findStoresUnderTheSameAdminAsThisGroup(storeId: string): Promise<Store[]> {
    const group = await this.findStoreByStoreId(storeId);

    const stores = await this.storeRepository.find({
      where: { admin: { id: group.admin.id } },
      relations: ['admin', 'latestDelivery', 'parentGroup', 'childShops']
    });
    return stores;

  }

  // Create Store with UUID retry logic
  async createStoreWithRetry(storeData: CreateStoreDto, maxRetries = 5): Promise<Store> {
    let attempts = 0;
    while (attempts < maxRetries) {
      attempts++;

      try {
        // Generate new UUID for storeId
        const store = this.storeRepository.create({
          ...storeData,
          storeId: uuidv4(),
          storeNameCode: storeData.storeName + storeData.storeCode,
        });

        return await this.storeRepository.save(store);
      } catch (error) {
        // Check if unique violation on storeId UUID column
        if (error.code === '23505' && error.detail && error.detail.includes('storeId')) {
          // UUID collision detected, retry
          console.warn(`UUID collision detected on attempt ${attempts}, retrying...`);
          continue;
        } else {
          // Other errors bubble up
          throw new InternalServerErrorException(error.message);
        }
      }
    }
    throw new InternalServerErrorException('Failed to create Store after multiple UUID retries.');
  }

}

