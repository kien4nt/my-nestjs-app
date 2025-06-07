import { AdminService } from './admin.service';
import { Admin } from './admin.entity';
import { Store } from '../store/store.entity'
import { Controller, Get, Param } from '@nestjs/common';
import { ApiParam, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('admins')
@Controller('admins')
export class AdminController {
    constructor(private readonly AdminService: AdminService) { }

    @Get(':adminId')
    @ApiOperation({ summary: 'Retrieve all stores managed by this admin' })
    @ApiParam({ name: 'adminId', description: 'The display ID of the admin', type: String })
    @ApiResponse({ status: 200, description: 'List of store managed by this admin.', type: [Store] })
    @ApiResponse({ status: 404, description: 'Admin not found.'})
    findStoresUnderThisAdmin(@Param("adminId") adminId: string,)
        : Promise<Store[]> {
        return this.AdminService.findStoresUnderThisAdmin(adminId);
    }

}
