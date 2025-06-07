import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from './admin.entity'
import {Store} from '../store/store.entity'
import { Repository } from 'typeorm';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Admin)
        private adminRepository : Repository<Admin>,
        @InjectRepository(Store)
        private storeRepository: Repository<Store>
    ){}


  //Find All Stores Under This Admin
  async findStoresUnderThisAdmin(adminId: string): Promise<Store[]> { 
    const admin = await this.adminRepository.findOne({where: {adminId}});
    if (!admin) {
        throw new NotFoundException(`Admin ${adminId} not found`);
    }

    return await this.storeRepository.find({
      where: {admin: {
        id: admin.id
    }}, 
      relations: ['admin'],
    }); 

}
}