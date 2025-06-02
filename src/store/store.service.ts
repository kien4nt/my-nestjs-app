import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './store.entity'; 
// import {Admin} from '../admin/admin.entity'

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    // @InjectRepository(Admin)
    // private adminRepository: Repository<Admin>,
  ) {}


  //Find All Stores
  async findAllStores(): Promise<Store[]> {
    return await this.storeRepository.find({
      relations: ['admin'],
    });
  }

  //Find A Store By its Id
  async findOneStoreById(id: number): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { id },
      relations: ['admin', 'parentGroup', 'childShops'],
    });
    if (!store) {
      throw new NotFoundException(`Store not found.`);
    }
    return store;
  }

  //Find A Store By its Display Id
  async findStoreByDisplayId(storeId: string): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { storeId },
      relations: ['admin', 'parentGroup', 'childShops'],
    });
    if (!store) {
      throw new NotFoundException(`Store ${storeId} not found.`);
    }
    return store;
  }

  //Find All Stores with type 'group'
  async filterGroupOnlyList(): Promise<Store[]> {
    return await this.storeRepository.find({
      where: { storeType: 'group' },
      relations: ['admin'],
    });
  }

  //Find All Shops Managed By This Group
  async findChildShopsOfThisGroup(storeId: string): Promise<Store[]> {
    const group = await this.storeRepository.findOne({ where: { storeId, storeType: 'group' } });
    if (!group) {
      throw new NotFoundException(`Group ${storeId} not found.`);
    }
    return await this.storeRepository.find({
      where: { parentGroup: { id: group.id } },
      relations: ['admin','parentGroup'],
    });
  }

  //Find All Stores Under This Admin
  async findStoresOfThisAdmin(adminId: number): Promise<Store[]> { 
    return await this.storeRepository.find({
      where: { admin: {id : adminId} },
      relations: ['admin'],
    });
  }

  
}