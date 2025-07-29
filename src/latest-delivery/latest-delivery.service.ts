import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LatestDelivery } from '../latest-delivery/latest-delivery.entity';
import { StoreService } from '../store/store.service'
import { LatestDeliveryRelation } from 'src/common/enums/relations.enum';


@Injectable()
export class LatestDeliveryService {
    constructor(
        @InjectRepository(LatestDelivery)
        private latestDeliveryRepository: Repository<LatestDelivery>,
        private readonly storeService: StoreService,
    ) { }

    async fetchLatestDeliveryOfThisStore(storeIdPK: number, relations: LatestDeliveryRelation[] = [LatestDeliveryRelation.STORE])
    : Promise<LatestDelivery | null> {
        
        const latestDelivery = await this.latestDeliveryRepository.findOne({
            where: { store: { id: storeIdPK } },
            relations: relations,
        });
        return latestDelivery;
    }

    async checkDeliverable(storeId: string): Promise<boolean> {
        const store = await this.storeService.fetchStoreByStoreId(storeId);
        if (!store) {
            throw new NotFoundException(`Store ${storeId} not found`)
        }

        const latestDelivery = await this.fetchLatestDeliveryOfThisStore(store.id);

        // If latest delivery is null (no delivery recorded) or transactionStatus is false (not in-process),
        // delivery can proceed
        // Otherwise, delivery should be canceled
        return latestDelivery === null || latestDelivery.transactionStatus === false;

    }

    async upsertLatestDelivery(data: LatestDelivery): Promise<LatestDelivery> {
        const storeIdPk = data.storeIdPK;

        const existing = await this.fetchLatestDeliveryOfThisStore(storeIdPk);

        if (existing) {
            // Update existing record
            existing.startDateTime = data.startDateTime;
            existing.endDateTime = data.endDateTime;
            existing.transactionType = data.transactionType;
            existing.transactionStatus = data.transactionStatus;
            existing.receiverList = data.receiverList;
            existing.errors = data.errors;
            return this.latestDeliveryRepository.save(existing);
        } else {
            // Create new record
            const newRecord = this.latestDeliveryRepository.create({
                ...data,
                store: data.store,
            });
            return await this.latestDeliveryRepository.save(newRecord);
        }
    }


}

