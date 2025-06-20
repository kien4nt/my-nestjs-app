import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { StoreService } from './store.service';
import { Store } from './store.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UuidDto } from 'src/common/dtos/uuid.dto';


@ApiTags('stores')
@Controller('stores')
export class StoreController {
    constructor(private readonly StoreService: StoreService) { }


    @Get('groups/:uuid/shops')
    @ApiOperation({ summary: 'Retrieve all child shops of a specific parent group' })
    @ApiParam({ name: 'uuid', description: 'The display ID of the parent group', type: String })
    @ApiResponse({ status: 200, description: 'List of child shops.', type: [Store] })
    @ApiResponse({ status: 404, description: 'Group not found.' })
    @ApiResponse({ status: 400, description: 'Invalid UUID format.' })
    async findChildShopsOfThisGroup(@Param() dto: UuidDto): Promise<Store[]> {
        return await this.StoreService.findChildShopsOfThisGroup(dto.uuid);
    }

    @Get('groups/:uuid/admin')
    @ApiOperation({ summary: 'Retrieve all stores which are under the same admin as this group' })
    @ApiParam({ name: 'uuid', description: 'The display ID of the group', type: String })
    @ApiResponse({
        status: 200,
        description: 'List of stores which are under the same admin as this group',
        type: [Store]
    })
    @ApiResponse({ status: 404, description: 'Group not found.' })
    @ApiResponse({ status: 400, description: 'Invalid UUID format.' })
    async findDeliverableStores(@Param() dto: UuidDto): Promise<Store[]> {
        return await this.StoreService.findStoresUnderTheSameAdminAsThisGroup(dto.uuid);
    }

    @Get('groups')
    @ApiOperation({ summary: 'Retrieve a list of all group-type stores' })
    @ApiResponse({ status: 200, description: 'List of group-type stores.', type: [Store] })
    async filterGroupOnlyList(): Promise<Store[]> {
        return await this.StoreService.filterGroupOnlyList();
    }

    @Get(':uuid')
    @ApiOperation({ summary: 'Retrieve a single store by its display ID' })
    @ApiParam({ name: 'uuid', description: 'The display ID of the store', type: String })
    @ApiResponse({ status: 200, description: 'The found store.', type: Store })
    @ApiResponse({ status: 404, description: 'Store not found.' })
    @ApiResponse({ status: 400, description: 'Invalid UUID format.' })
    async findOne(@Param() dto: UuidDto): Promise<Store> {
        return await this.StoreService.findStoreByStoreId(dto.uuid);
    }

    @Post()
    @ApiOperation({ summary: 'Create a new store' })
    @ApiBody({
        description: 'Store data',
        type: CreateStoreDto
    })
    @ApiResponse({
        status: 201,
        description: 'The store has been successfully created.',
        type: Store
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request. Validation failed or other error.'
    })
    async createStore(@Body() storeData: CreateStoreDto): Promise<Store> {
        try {
            return await this.StoreService.createStoreWithRetry(storeData);
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Get()
    @ApiOperation({ summary: 'Retrieve all stores' })
    @ApiResponse({ status: 200, description: 'List of all stores.', type: [Store] })
    async findAll(): Promise<Store[]> {
        return await this.StoreService.findAllStores();
    }


}