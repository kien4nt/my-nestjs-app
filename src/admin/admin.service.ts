import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from './admin.entity'
import { Store } from '../store/store.entity'
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CreateAdminDto } from './dto/create-admin.dto';
import { validateSync } from 'class-validator';
import { UuidDto } from 'src/common/dtos/uuid.dto';
import * as fs from 'fs-extra';
import * as path from 'path';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>
  ) { }


  async createDeliveryFolders() {
    let result = '';
    
    const base_dir = path.resolve(process.cwd(),'..', 'data');
    const admins = await this.adminRepository.find(
      { select: ['adminId'] }
    );
    for (const admin of admins) {
      const adminId = admin.adminId;
      const hqDitPath = path.join(base_dir,'hq', adminId);
      try {
        await fs.ensureDir(hqDitPath);
        result += `INFO : Directory ${hqDitPath} ensured successfully (created if not exists).\n`;
      }
      catch (err) {
        result += `ERROR: Error ensuring directory ${hqDitPath}: ${err}\n`;
      }

      const stores = await this.findStoresUnderThisAdmin(adminId);
      for (const store of stores) {
        const storeId = store.storeId;
        const dirPath = path.join(base_dir, adminId, storeId,'gae_upload');
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

 

  //Find the admin record by adminId
  async findAdminByAdminId(adminId: string): Promise<Admin> {
    const admin = await this.adminRepository.findOne({ where: { adminId } });
    if (!admin) {
      throw new NotFoundException(`Admin ${adminId} not found`);
    }

    return admin;
  }

  //Find All Stores Under This Admin
  async findStoresUnderThisAdmin(adminId: string): Promise<Store[]> {
    const admin = await this.findAdminByAdminId(adminId);

    return await this.storeRepository.find({
      where: {
        admin: {
          id: admin.id
        }
      },
      relations: ['admin'],
    });

  }

  // Create Admin with UUID retry logic
  async createAdminWithRetry(adminData: CreateAdminDto, maxRetries = 5): Promise<Admin> {
    let attempts = 0;
    while (attempts < maxRetries) {
      attempts++;

      try {
        // Generate new UUID for adminId
        const admin = this.adminRepository.create({
          ...adminData,
          adminId: uuidv4(),
        });

        return await this.adminRepository.save(admin);
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

}