import { AdminService } from './admin.service';
import { Admin } from './admin.entity';
import { Store } from '../store/store.entity'
import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiParam, ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateAdminDto } from './dto/create-admin.dto';
import { catchError } from 'rxjs';
import { UuidDto } from 'src/common/dtos/uuid.dto';

@ApiTags('admins')
@Controller('admins')
export class AdminController {
    constructor(private readonly AdminService: AdminService) { }
    
    @Get('create-delivery-folders')
    async createDeliveryFolders(){
        return await this.AdminService.createDeliveryFolders();
    }

    @Get(':uuid')
    @ApiOperation({ summary: 'Retrieve all stores managed by this admin' })
    @ApiParam({ name: 'uuid', description: 'The display ID of the admin', type: String })
    @ApiResponse({ status: 200, description: 'List of store managed by this admin.', type: [Store] })
    @ApiResponse({ status: 404, description: 'Admin not found.' })
    @ApiResponse({ status: 400, description: 'Invalid UUID format.' })
    async findStoresUnderThisAdmin(@Param() dto: UuidDto,)
        : Promise<Store[]> {
        return await this.AdminService.findStoresUnderThisAdmin(dto.uuid);
    }


    @Post()
    @ApiOperation({ summary: 'Create a new admin' })
    @ApiBody({
        description: 'Admin data',
        type: CreateAdminDto
    })
    @ApiResponse({
        status: 201,
        description: 'The admin has been successfully created.',
        type: Admin
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request. Validation failed or other error.'
    })
    async createAdmin(@Body() adminData: CreateAdminDto): Promise<Admin> {
        try {
            return await this.AdminService.createAdminWithRetry(adminData);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

}
