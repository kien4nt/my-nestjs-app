import {
    Controller,
    Get,
    Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { StoreService } from './store.service';
import { Store } from './store.entity';


@ApiTags('stores')
@Controller('stores')
export class StoreController {
    constructor(private readonly StoreService: StoreService) { }

    @Get('groups/:groupDisplayId/shops')
    @ApiOperation({ summary: 'Retrieve all child shops of a specific parent group' })
    @ApiParam({ name: 'groupDisplayId', description: 'The display ID of the parent group', type: String })
    @ApiResponse({ status: 200, description: 'List of child shops.', type: [Store] })
    @ApiResponse({ status: 404, description: 'Group not found.' })
    findChildShopsOfThisGroup(@Param('groupDisplayId') groupDisplayId: string): Promise<Store[]> {
        return this.StoreService.findChildShopsOfThisGroup(groupDisplayId);
    }

    @Get('groups')
    @ApiOperation({ summary: 'Retrieve a list of all group-type stores' })
    @ApiResponse({ status: 200, description: 'List of group-type stores.', type: [Store] })
    filterGroupOnlyList(): Promise<Store[]> {
        return this.StoreService.filterGroupOnlyList();
    }


    @Get(':storeDisplayId')
    @ApiOperation({ summary: 'Retrieve a single store by its display ID' })
    @ApiParam({ name: 'storeDisplayId', description: 'The display ID of the store', type: String })
    @ApiResponse({ status: 200, description: 'The found store.', type: Store })
    @ApiResponse({ status: 404, description: 'Store not found.' })
    findOne(@Param('storeDisplayId') storeDisplayId: string): Promise<Store> {
        return this.StoreService.findStoreByDisplayId(storeDisplayId);
    }


    @Get()
    @ApiOperation({ summary: 'Retrieve all stores' })
    @ApiResponse({ status: 200, description: 'List of all stores.', type: [Store] })
    findAll(): Promise<Store[]> {
        return this.StoreService.findAllStores();
    }

}