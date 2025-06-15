import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryHistory } from './delivery-history.entity';
import { CreateDeliveryHistoryDto } from './dto/create-delivery-history.dto';
import { UpdateDeliveryHistoryDto, UpdateErrorDetailDto } from './dto/update-delivery-history.dto';
import { StoreService } from '../store/store.service';
import { LatestDeliveryService } from '../latest-delivery/latest-delivery.service';
import { LatestDelivery } from '../latest-delivery/latest-delivery.entity';
import { Store } from '../store/store.entity';
import { DeliveryHistoryRO } from './ro/delivery-history.ro';
import { plainToInstance } from 'class-transformer';
import { ErrorDetail } from 'src/common/interfaces/error-detail.interface';

@Injectable()
export class DeliveryHistoryService {
  constructor(
    @InjectRepository(DeliveryHistory)
    private deliveryHistoryRepository: Repository<DeliveryHistory>,
    private readonly storeService: StoreService,
    private readonly latestDeliveryService: LatestDeliveryService,
  ) { }

  async findDeliveryHistoryByReceiverStoreId(receiverStoreId: string): Promise<DeliveryHistoryRO[]> {
    const receiverStore = await this.storeService.findStoreByStoreId(receiverStoreId);
    const historyRecords = await this.deliveryHistoryRepository.find(
      {
        where: {
          receiverStore: {
            id: receiverStore.id,
          }
        },
        relations: ['receiverStore', 'senderStore'],
      }
    );


    return historyRecords.map(record => this.mapEntityToResponseObject(record))
  }

  mapEntityToResponseObject(historyRecord: DeliveryHistory): DeliveryHistoryRO {
    return plainToInstance(
      DeliveryHistoryRO, historyRecord,
      {
        excludeExtraneousValues: true,
      }
    );
  }



  //Create new record for sender and respective receivers
  async create(dto: CreateDeliveryHistoryDto) {
    const sender = await this.storeService.findStoreByStoreId(dto.senderStoreId);

    //Check if sender is busy
    const senderLatestDelivery = sender.latestDelivery;
    const isSenderProceedable = !senderLatestDelivery || senderLatestDelivery.transactionStatus === false;
    if (!isSenderProceedable) throw new BadRequestException('Sender is currently in a delivery process.');

    const receivers: Store[] = [];
    if (dto.receiverList) {
      const allReceivers = await this.storeService.findStoresUnderTheSameAdminAsThisGroup(sender.storeId);

      for (const receiver of allReceivers) {
        //Ensure receiverStore is present in receiverList
        if (!dto.receiverList[receiver.storeId]) {
          continue;
        }

        //Prevent self-sending
        if (receiver.id === sender.id) {
          continue;
        }

        //In case receiverStore is a shop managed by sender
        const isManagedShop = sender.childShops.some(childShop => childShop.id === receiver.id);

        //Check if receiver is busy
        const receiverLatestDelivery = receiver.latestDelivery;
        const isReceiverProceedable =
          !receiverLatestDelivery
          || receiverLatestDelivery.transactionStatus === false;
        if ((isManagedShop || receiver.storeType === 'group') && isReceiverProceedable) {
          receivers.push(receiver);
        }
      }
    }

    const now = new Date();

    const deliveryRecords: DeliveryHistory[] = [];
    const latestDeliveries: LatestDelivery[] = [];

    const errorList: ErrorDetail[] = dto.errors?.length 
    ? dto.errors.map(err => (
      {
        errorCode: err.errorCode || "",
        errorMessage: err.errorMessage || "",
      }
    ))
    : [];

    // Create sender delivery record
    const senderDelivery = this.deliveryHistoryRepository.create({
      ...dto,
      startDateTime: now,
      endDateTime: now,
      senderStore: sender,
      transactionType: 'send',
      transactionStatus: true,
      errors: errorList,
    });
    deliveryRecords.push(senderDelivery);

    const senderLatest: LatestDelivery = {
      storeIdPK: sender.id,
      store: sender,
      startDateTime: now,
      endDateTime: now,
      transactionType: 'send',
      transactionStatus: true,
      receiverList: dto.receiverList || {},
      errors: errorList,
    };
    latestDeliveries.push(senderLatest);

    // Create receiver delivery records
    for (const receiver of receivers) {
      const receiverDelivery = this.deliveryHistoryRepository.create({
        startDateTime: now,
        endDateTime: now,
        senderStore: sender,
        receiverStore: receiver,
        transactionStatus: true,
        transactionType: 'receive',
        receiverList: {},
        errors: [],
      });
      deliveryRecords.push(receiverDelivery);

      const receiverLatest: LatestDelivery = {
        storeIdPK: receiver.id,
        store: receiver,
        startDateTime: now,
        endDateTime: now,
        transactionType: 'receive',
        transactionStatus: true,
        receiverList: {},
        errors: [],
      };
      latestDeliveries.push(receiverLatest);
    }

    const before = Date.now();
    const insertResult = await this.deliveryHistoryRepository.save(deliveryRecords);
    const timeTook = Date.now() - before;
    await Promise.all(latestDeliveries.map(
      latestDeli => this.latestDeliveryService.upsertLatestDelivery(latestDeli)));

    const returnResult: DeliveryHistoryRO[] = [];
    insertResult.forEach(res => {
      returnResult.push(this.mapEntityToResponseObject(res))
    })

    return {
      'time': `${timeTook} ms`,
      'result': returnResult
    };
  }

  //Update attribute of a record
  async update(id: number, dto: UpdateDeliveryHistoryDto) {
    const delivery = await this.deliveryHistoryRepository.findOne({
      where: { id },
      relations: ['senderStore', 'receiverStore'],
    });

    if (!delivery) throw new NotFoundException(`Delivery record ${id} not found.`);

    //Separate errors from other properties of dto
    const { errors, ...rest } = dto;


    // Update provided fields from dto except errors
    Object.assign(delivery, rest);


    // If explicitly marked completed -> update endDateTime
    // Else update errors if any
    if (dto.transactionStatus === false) {
      delivery.endDateTime = new Date();
      delivery.errors.length = 0;
    }
    else if (errors) {
      delivery.errors = 
      errors.length 
      ? errors.map(err => (
        {
          errorCode: err.errorCode || "",
          errorMessage: err.errorMessage || "",
        }
      ))
      : [];
    }


    //Update sender, receiver if any
    if (dto.receiverStoreId) {
      delivery.receiverStore = await this.storeService.findStoreByStoreId(dto.receiverStoreId);
    }

    if (dto.senderStoreId) {
      delivery.senderStore = await this.storeService.findStoreByStoreId(dto.senderStoreId);
    }



    const before = Date.now();
    const updatedRecord = await this.deliveryHistoryRepository.save(delivery);
    const timeTook = Date.now() - before;

    // Sync latest-delivery of the related store
    const relatedStore = updatedRecord.transactionType === 'send'
      ? delivery.senderStore
      : delivery.receiverStore;

    if (!relatedStore) throw new NotFoundException(`Store not linked in delivery #${id}`);

    const latest = await this.latestDeliveryService.findLatestDeliveryOfThisStore(
      relatedStore.id,
    );

    if (latest) {
      // If explicitly marked completed -> update endDateTime
      // Else update errors if any
      if (dto.transactionStatus === false) {
        latest.transactionStatus = false;
        latest.endDateTime = new Date();
        latest.errors.length = 0;
      }
      else if (errors) {
        latest.errors = 
        errors.length 
        ? errors.map(err => (
          {
            errorCode: err.errorCode || "",
            errorMessage: err.errorMessage || "",
          }
        ))
        : [];
      }

      await this.latestDeliveryService.upsertLatestDelivery(latest);
    }

    return {
      'time': `${timeTook} ms`,
      'result': this.mapEntityToResponseObject(updatedRecord),
    };
  }




}
