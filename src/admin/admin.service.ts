import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from './admin.entity'
import { Store } from '../store/store.entity'
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CreateAdminDto } from './dto/create-admin.dto';
import * as fs from 'fs-extra';
import * as path from 'path';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { plainToInstance } from 'class-transformer';
import { AdminRO } from './ro/admin.ro';
import { StoreRO } from 'src/store/ro/store.ro';
import { StoreService } from 'src/store/store.service';
import { StoreRelation } from 'src/common/enums/relations.enum';
import { CreateStoreDto } from 'src/store/dto/create-store.dto';
import { StoreType } from 'src/common/enums/store-type.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    private readonly storeService: StoreService,
  ) { }


  async createDeliveryFolders(): Promise<string> {
    let result = '';

    const base_dir = path.resolve(process.cwd(), '..', 'data');
    const admins = await this.adminRepository.find(
      { select: ['adminId'] }
    );
    for (const admin of admins) {
      const adminId = admin.adminId;
      const hqDitPath = path.join(base_dir, 'hq', adminId);
      try {
        await fs.ensureDir(hqDitPath);
        result += `INFO : Directory ${hqDitPath} ensured successfully (created if not exists).\n`;
      }
      catch (err) {
        result += `ERROR: Error ensuring directory ${hqDitPath}: ${err}\n`;
      }

      const stores = await this.fetchStoresByAdminId(adminId);
      for (const store of stores) {
        const storeId = store.storeId;
        const dirPath = path.join(base_dir, adminId, storeId, 'gae_upload');
        try {
          await fs.ensureDir(dirPath);
          result += `INFO : Directory ${dirPath} ensured successfully (created if not exists).\n`;
        } catch (err) {
          result += `ERROR: Error ensuring directory ${dirPath}: ${err}\n`;
        }
      }
    }
    return result.trim();
  }

  //Caller method to find admin by adminId
  async findAdminByAdminId(adminId: string): Promise<AdminRO> {
    const admin = await this.fetchAdminDataByAdminId(adminId);
    if (!admin) {
      throw new NotFoundException(`Admin ${adminId} not found`);
    }
    return this.mapEntityToResponseObject(admin);
  }

  //Fetch the admin data by adminId
  async fetchAdminDataByAdminId(adminId: string): Promise<Admin | null> {
    return await this.adminRepository.findOne({ where: { adminId } });
  }

  //Caller method to find stores by adminId
  async findStoresUnderThisAdmin(adminId: string): Promise<Record<string, StoreRO[]>> {
    const relations = [StoreRelation.PARENT_GROUP];
    const stores = await this.fetchStoresByAdminId(adminId, relations);
    if (!stores || stores.length === 0) {
      throw new NotFoundException(`No stores found for admin ${adminId}`);
    }
    const response = stores.map(store => this.storeService.mapEntityToResponseObject(store));
    return {
      [adminId]: response
    }
  }

  //Fetch stores by adminId
  async fetchStoresByAdminId(adminId:string, relations:StoreRelation[] = []): Promise<Store[]>{
    const admin = await this.fetchAdminDataByAdminId(adminId);
    if (!admin) {
      throw new NotFoundException(`Admin ${adminId} not found`);
    }
    const stores = await this.storeRepository.find({
      where: {
        admin: {
          id: admin.id
        }
      },
      relations: relations
    });
    
    return stores; 
  }

  // Create Admin with UUID retry logic
  async createAdminWithRetry(adminData: CreateAdminDto, maxRetries = 5): Promise<AdminRO> {
    let attempts = 0;
    while (attempts < maxRetries) {
      attempts++;

      try {
        // Generate new UUID for adminId
        const admin = this.adminRepository.create({
          ...adminData,
          adminId: uuidv4(),
        });

        return this.mapEntityToResponseObject(
          await this.adminRepository.save(admin)
        );
      } catch (error) {
        // Check if unique violation on adminId UUID column
        if (error.code === '23505' && error.detail && error.detail.includes('adminId')) {
          // UUID collision detected, retry
          console.warn(`UUID collision detected on attempt ${attempts}, retrying...`);
          continue;
        } else {
          // Other errors bubble up
          throw new InternalServerErrorException(error.message);
        }
      }
    }
    throw new InternalServerErrorException('Failed to create Admin after multiple UUID retries.');
  }

  async update(adminId: string, updateData: UpdateAdminDto): Promise<AdminRO> {
    const admin = await this.fetchAdminDataByAdminId(adminId);
    if (!admin) {
      throw new NotFoundException(`Admin ${adminId} not found`);
    }
    // Update the admin entity with new data
    Object.assign(admin, updateData);

    return this.mapEntityToResponseObject(
      await this.adminRepository.save(admin)
    );
  }

  async deactivate(adminId: string): Promise<AdminRO> {
    const admin = await this.fetchAdminDataByAdminId(adminId);
    if (!admin) {
      throw new NotFoundException(`Admin ${adminId} not found`);
    }
    // Change active status
    const newStatus = !admin.isActive;
    admin.isActive = newStatus;
    return this.mapEntityToResponseObject(
      await this.adminRepository.save(admin)
    );
  }

  // Create Store with UUID retry logic
  async createStoreWithRetry(storeData: CreateStoreDto, maxRetries = 5): Promise<StoreRO> {
    const adminId = storeData.adminId;
    const admin = await this.fetchAdminDataByAdminId(adminId);
    if (!admin) {
      throw new NotFoundException(`Admin ${adminId} not found.`);
    }
    const adminIdPk = admin.id;

    const parentGroupStoreId = storeData.parentGroupStoreId;
    let parentGroup: Store | null = null;
    if (parentGroupStoreId) {
      parentGroup = await this.storeService.fetchStoreByStoreId(parentGroupStoreId);
      if (!parentGroup || parentGroup.storeType !== StoreType.GROUP) {
        throw new NotFoundException(`Parent group ${parentGroupStoreId} not found or is not a group.`);
      }
    }
    
    let attempts = 0;
    while (attempts < maxRetries) {
      attempts++;

      try {
        // Generate new UUID for storeId
        const storeType = storeData.storeType;
        const store = this.storeRepository.create({
          ...storeData,
          storeId: uuidv4(),
          storeNameCode: storeData.storeName + storeData.storeCode,
          admin: { id: adminIdPk , adminId: admin.adminId },
          parentGroup: parentGroup && storeType === StoreType.SHOP 
          ? {id: parentGroup.id, storeId: parentGroup.storeId}
          : undefined,
        });

        return this.storeService.mapEntityToResponseObject(
          await this.storeRepository.save(store));
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


  mapEntityToResponseObject(admin: Admin): AdminRO {
    return plainToInstance(
      AdminRO, admin,
      {
        excludeExtraneousValues: true,
      }
    );
  }

}