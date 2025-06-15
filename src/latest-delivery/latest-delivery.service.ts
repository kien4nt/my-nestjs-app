import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LatestDelivery } from '../latest-delivery/latest-delivery.entity';
import { StoreService } from '../store/store.service'


@Injectable()
export class LatestDeliveryService {
    constructor(
        @InjectRepository(LatestDelivery)
        private latestDeliveryRepository: Repository<LatestDelivery>,
        private readonly StoreService: StoreService,
    ) { }

    async findLatestDeliveryOfThisStore(storeIdPK: number): Promise<LatestDelivery | null> {

        const latestDelivery = await this.latestDeliveryRepository.findOne({
            where: { store: { id: storeIdPK } },
            relations: ['store'],
        });
        return latestDelivery;
    }

    async checkDeliverable(storeId: string): Promise<boolean> {
        const store = await this.StoreService.findStoreByStoreId(storeId);
        if (!store) {
            throw new NotFoundException(`Store ${storeId} not found`)
        }

        const latestDelivery = await this.findLatestDeliveryOfThisStore(store.id);

        // NO RECORD IN HISTORY -> DELIVERABLE
        if (latestDelivery === null) {
            return true;
        }

        // TRANSACTION IN-PROCESS -> NOT DELIVERABLE
        if (latestDelivery.transactionStatus === true) {
            return false;
        }
        // TRANSACTION COMPLETED -> DELIVERABLE
        else if (latestDelivery.transactionStatus === false) {
            return true;
        }
        // UNEXPECTED ERROR -> NOT DELIVERABLE
        return false;

    }

    async upsertLatestDelivery(data: LatestDelivery): Promise<LatestDelivery> {
        const existing = await this.latestDeliveryRepository.findOne({
            where: { store: { id: data.storeIdPK } },
            relations: ['store'],
        });

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

