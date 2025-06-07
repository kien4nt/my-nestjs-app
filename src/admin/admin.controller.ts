import { AdminService } from './admin.service';
import { Admin } from './admin.entity';
import { Store } from '../store/store.entity'
import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiParam, ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateAdminDto } from './dto/create-admin.dto';
import { catchError } from 'rxjs';

@ApiTags('admins')
@Controller('admins')
export class AdminController {
    constructor(private readonly AdminService: AdminService) { }

    @Get(':adminId')
    @ApiOperation({ summary: 'Retrieve all stores managed by this admin' })
    @ApiParam({ name: 'adminId', description: 'The display ID of the admin', type: String })
    @ApiResponse({ status: 200, description: 'List of store managed by this admin.', type: [Store] })
    @ApiResponse({ status: 404, description: 'Admin not found.' })
    async findStoresUnderThisAdmin(@Param("adminId") adminId: string,)
        : Promise<Store[]> {
        return await this.AdminService.findStoresUnderThisAdmin(adminId);
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
