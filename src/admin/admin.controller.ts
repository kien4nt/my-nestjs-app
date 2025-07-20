import { AdminService } from './admin.service';
import { Admin } from './admin.entity';
import { Store } from '../store/store.entity'
import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { ApiParam, ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateAdminDto } from './dto/create-admin.dto';
import { catchError } from 'rxjs';
import { UuidDto } from 'src/common/dtos/uuid.dto';
import { AdminRO } from './ro/admin.ro';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { StoreRO } from 'src/store/ro/store.ro';

@ApiTags('admins')
@Controller('admins')
export class AdminController {
    constructor(private readonly AdminService: AdminService) { }

    @Get(':uuid/stores')
    @ApiOperation({ summary: 'Retrieve all stores managed by this admin' })
    @ApiParam({ name: 'uuid', description: 'The display ID of the admin', type: String })
    @ApiResponse({ status: 200, description: 'List of store managed by this admin.', type: [Store] })
    @ApiResponse({ status: 404, description: 'Admin not found.' })
    @ApiResponse({ status: 400, description: 'Invalid UUID format.' })
    async findStoresUnderThisAdmin(@Param() dto: UuidDto,)
        : Promise<Record<string,StoreRO[]>> {
        return await this.AdminService.findStoresUnderThisAdmin(dto.uuid);
    }

    @Put(':uuid/deactivate')
    @ApiOperation({ summary: 'Deactivate an admin' })
    @ApiParam({ name: 'uuid', description: 'The  UUID of the admin to deactivate', type: String })
    @ApiResponse({ status: 200, description: 'Admin deactivated successfully.', type: AdminRO })
    @ApiResponse({ status: 404, description: 'Admin not found.' })
    @ApiResponse({ status: 400, description: 'Invalid UUID format.' })
    async deactivateAdmin(@Param() dto: UuidDto): Promise<AdminRO> {
        try {
            return await this.AdminService.deactivate(dto.uuid);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Put(':uuid/update')
    @ApiOperation({ summary: 'Update admin details by UUID' })
    @ApiParam({ name: 'uuid', description: 'The UUID of the admin to update', type: String })
    @ApiBody({
        description: 'Updated admin data',
        type: UpdateAdminDto
    })
    @ApiResponse({ status: 200, description: 'Admin updated successfully.', type: AdminRO })
    @ApiResponse({ status: 404, description: 'Admin not found.' })
    @ApiResponse({ status: 400, description: 'Invalid UUID format or validation error.' })
    async updateAdmin(@Param() dto: UuidDto, @Body() updateData: UpdateAdminDto): Promise<AdminRO> {
        try {
            return await this.AdminService.update(dto.uuid, updateData);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }


    @Get('create-delivery-folders')
    @ApiOperation({ summary: 'Create delivery folders for all admins and their stores' })
    @ApiResponse({ status: 200, description: 'Delivery folders created successfully.' })
    @ApiResponse({ status: 500, description: 'Internal server error.' })
    @ApiResponse({ status: 400, description: 'Bad request.' })
    async createDeliveryFolders(): Promise<string> {
        return await this.AdminService.createDeliveryFolders();
    }



    @Post('create')
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
    async createAdmin(@Body() adminData: CreateAdminDto): Promise<AdminRO> {
        try {
            return await this.AdminService.createAdminWithRetry(adminData);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }



    @Get(':uuid')
    @ApiOperation({ summary: 'Get admin details by UUID' })
    @ApiParam({ name: 'uuid', description: 'The UUID of the admin', type: String })
    @ApiResponse({ status: 200, description: 'Admin details retrieved successfully.', type: AdminRO })
    @ApiResponse({ status: 404, description: 'Admin not found.' })
    @ApiResponse({ status: 400, description: 'Invalid UUID format.' })
    async findAdminByUuid(@Param() dto: UuidDto): Promise<AdminRO> {
        try {
            return await this.AdminService.findAdminByAdminId(dto.uuid);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }



}
