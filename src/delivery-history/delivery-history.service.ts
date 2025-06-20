import { format } from 'date-fns';
import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, HttpStatus } from '@nestjs/common';
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
import { isUUID, validateSync } from 'class-validator';
import { UuidDto } from 'src/common/dtos/uuid.dto';
import * as fs from 'fs-extra';
import * as path from 'path';

@Injectable()
export class DeliveryHistoryService {
  constructor(
    @InjectRepository(DeliveryHistory)
    private deliveryHistoryRepository: Repository<DeliveryHistory>,
    private readonly storeService: StoreService,
    private readonly latestDeliveryService: LatestDeliveryService,
  ) { }


  async findSendingHistoryByReceiverStoreId(receiverStoreId: string): Promise<DeliveryHistoryRO[]> {
    const errors = validateSync(new UuidDto(receiverStoreId));
    if (errors.length > 0) {
      throw new BadRequestException('Invalid receiverStoreId provided!');
    }
    const historyRecords = await this.deliveryHistoryRepository
      .createQueryBuilder('history')
      .leftJoinAndSelect("history.senderStore", "sender")
      .where(`history.receiverList @> ARRAY[:receiverStoreId]::jsonb`, { receiverStoreId })
      .getMany();

    return historyRecords.map(record => this.mapEntityToResponseObject(record));
  }


  async findReceivingHistoryByReceiverStoreId(receiverStoreId: string): Promise<DeliveryHistoryRO[]> {
    const errors = validateSync(new UuidDto(receiverStoreId));
    if (errors.length > 0) {
      throw new BadRequestException('Invalid receiverStoreId provided!');
    }
    const receiverStore = await this.storeService.findStoreByStoreId(receiverStoreId);
    const historyRecords = await this.deliveryHistoryRepository.find(
      {
        where: {
          receiverStore: {
            id: receiverStore.id,
          }
        },
        relations: ['receiverStore', 'senderStore']
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

  async delivery(dto: CreateDeliveryHistoryDto):Promise<DeliveryHistoryRO[]> {

    //Check if there is any receiver
    if (!dto.receiverList?.length) {
      throw new BadRequestException("Receiver list cannot be empty!");
    }


    const sender = await this.storeService.findStoreByStoreId(dto.senderStoreId);

    //Check if sender is busy
    const senderLatestDelivery = sender.latestDelivery;
    const isSenderProceedable = !senderLatestDelivery || senderLatestDelivery.transactionStatus === false;
    if (!isSenderProceedable) throw new BadRequestException('Sender is currently in a delivery process.');

    //Ensure uniqueness
    const uniqueReceiverUUIDs = [...new Set(dto.receiverList)];
    const candidates = await this.storeService.findStoresByStoreIdList(uniqueReceiverUUIDs);
    const receivers: Store[] = [];
    for (const receiver of candidates) {
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


    //Prepare folder name
    const adminId = sender.admin.adminId;
    const senderStoreId = sender.storeId;
    const receiverStoreIds = receivers.map(receiver => receiver.storeId);

    //Prepare file path
    const baseDir = path.resolve(process.cwd(), 'delivery_data', adminId);
    const sourcePath = path.join(baseDir, senderStoreId);

    //--- START ---
    const deliveryRecords: DeliveryHistory[] = [];
    const senderErrors: ErrorDetail[] = [];

    //Get startTime of sender
    const senderStartTime = new Date();

    // Create sender delivery record
    const senderDelivery = this.deliveryHistoryRepository.create({
      startDateTime: senderStartTime,
      endDateTime: senderStartTime,
      transactionStatus: true,
      transactionType: 'send',
      receiverList: receiverStoreIds,
      senderStore: sender,
      errors: senderErrors,
    });

    const senderLatest: LatestDelivery = {
      storeIdPK: sender.id,
      store: sender,
      startDateTime: senderStartTime,
      endDateTime: senderStartTime,
      transactionType: 'send',
      transactionStatus: true,
      receiverList: receiverStoreIds,
      errors: senderErrors,
    };

    //Save the initial state
    const insertedSender = await this.deliveryHistoryRepository.save(senderDelivery);
    await this.latestDeliveryService.upsertLatestDelivery(senderLatest);


    try {
      // Validate source folder existence
      if (!await fs.pathExists(sourcePath)) {
        throw new BadRequestException(`Source folder "${senderStoreId}" does not exist at ${sourcePath}`);
      }
      if (!(await fs.lstat(sourcePath)).isDirectory()) {
        throw new BadRequestException(`Source "${senderStoreId}" is not a directory.`);
      }

      //Iterate through receiverList
      for (const receiver of receivers) {
        const receiverStoreId = receiver.storeId;
        const destinationPath = path.join(baseDir, receiverStoreId);
        const receiverErrors: ErrorDetail[] = [];


        //Get start time of the current receiver
        // Assign a default value to receiverEndTime
        const receiverStartTime = new Date();
        let receiverEndTime = receiverStartTime;

        const receiverDelivery = this.deliveryHistoryRepository.create({
          startDateTime: receiverStartTime,
          endDateTime: receiverStartTime,
          transactionStatus: true,
          transactionType: 'receive',
          receiverList: [],
          receiverStore: receiver,
          senderStore: sender,
          errors: [],
        });

        const receiverLatest: LatestDelivery = {
          storeIdPK: receiver.id,
          store: receiver,
          startDateTime: receiverStartTime,
          endDateTime: receiverStartTime,
          transactionType: 'receive',
          transactionStatus: true,
          receiverList: [],
          errors: [],
        };

        //Save the initial state
        const insertedReceiver = await this.deliveryHistoryRepository.save(receiverDelivery);
        await this.latestDeliveryService.upsertLatestDelivery(receiverLatest);

        try {
          // Validate destination folder existence 
          if (!await fs.pathExists(destinationPath)) {
            //Get errored time of the current receiver 
            receiverEndTime = new Date();
            const errorDetail: ErrorDetail = {
              errorCode: HttpStatus.BAD_REQUEST.toString(),
              errorMessage: `Destination folder "${receiverStoreId}" does not exist. Skipping.`
            };

            //Append error to receiver
            receiverErrors.push(errorDetail)


          }

          if (!(await fs.lstat(destinationPath)).isDirectory()) {
            //Get errored time of the current receiver 
            receiverEndTime = new Date();
            const errorDetail: ErrorDetail = {
              errorCode: HttpStatus.BAD_REQUEST.toString(),
              errorMessage: `Destination "${receiverStoreId}" is not a directory. Skipping.`
            };

            //Append error to receiver
            receiverErrors.push(errorDetail)

          }

          //Perform copy only if no error
          if (receiverErrors.length > 0) {
            insertedReceiver.endDateTime = receiverLatest.endDateTime = receiverEndTime;
            insertedReceiver.errors = receiverLatest.errors = receiverErrors;
          }
          else {
            // Perform the copy operation
            // `copy` recursively copies files and directories.
            // `overwrite: true` means existing files in destination will be overwritten.
            await fs.copy(sourcePath, destinationPath, { overwrite: true });

            //Get completed time of the current receiver 
            insertedReceiver.endDateTime = receiverLatest.endDateTime = new Date();
            console.log(`Copied content from "${senderStoreId}" to "${receiverStoreId}"`);
          }



        } catch (error) {
          //Get errored time of the current receiver 
          insertedReceiver.endDateTime = receiverLatest.endDateTime = new Date();
          const unknownError: ErrorDetail = {
            errorCode: HttpStatus.INTERNAL_SERVER_ERROR.toString(),
            errorMessage: `An error occured while copying content from "${senderStoreId}" to "${receiverStoreId}", ${error}`
          }
          //Append error to receiver
          receiverErrors.push(unknownError);
          insertedReceiver.errors = receiverLatest.errors = receiverErrors;

        }

        insertedReceiver.transactionStatus = receiverLatest.transactionStatus = false;

        const updatedReceiver = await this.deliveryHistoryRepository.save(insertedReceiver);
        deliveryRecords.push(updatedReceiver);
        await this.latestDeliveryService.upsertLatestDelivery(receiverLatest);


        //Append errors from receiver to sender
        if (receiverErrors.length > 0) {
          senderErrors.push(...receiverErrors);
        }
      }



    } catch (error) {
      //Get errored time of sender
      insertedSender.endDateTime = senderLatest.endDateTime = new Date();

      //Resolve errorDetail
      let errorCode = '';
      const errorMessage = error.message;

      if (error instanceof BadRequestException) {
        errorCode = HttpStatus.BAD_REQUEST.toString();
      }
      else if (error instanceof Error || error instanceof InternalServerErrorException) {
        errorCode = HttpStatus.INTERNAL_SERVER_ERROR.toString();
      }
      else {
        errorCode = 'UNKNOWN'
      }

      //Append error to sender
      senderErrors.push({
        errorCode: errorCode,
        errorMessage: errorMessage
      });

      console.log('An error occured:', errorCode, errorMessage);

    }

    // Update errors if any
    // Else update completion time
    if (senderErrors.length > 0) {
      insertedSender.errors = senderLatest.errors = senderErrors;
    }
    else {
      insertedSender.endDateTime = senderLatest.endDateTime = new Date();
    }
    insertedSender.transactionStatus = senderLatest.transactionStatus = false;

    const updatedSender = await this.deliveryHistoryRepository.save(insertedSender);
    deliveryRecords.push(updatedSender);
    await this.latestDeliveryService.upsertLatestDelivery(senderLatest);

    return deliveryRecords.map(deliveryRecord => this.mapEntityToResponseObject(deliveryRecord));

  }


  //Create new record for sender and respective receivers
  async create(dto: CreateDeliveryHistoryDto): Promise<DeliveryHistoryRO[]> {

    //Check if there is any receiver
    if (!dto.receiverList?.length) {
      throw new BadRequestException("Receiver list cannot be empty!");
    }

    const sender = await this.storeService.findStoreByStoreId(dto.senderStoreId);

    //Check if sender is busy
    const senderLatestDelivery = sender.latestDelivery;
    const isSenderProceedable = !senderLatestDelivery || senderLatestDelivery.transactionStatus === false;
    if (!isSenderProceedable) throw new BadRequestException('Sender is currently in a delivery process.');

    //Ensure uniqueness
    const uniqueReceiverUUIDs = [...new Set(dto.receiverList)];
    const candidates = await this.storeService.findStoresByStoreIdList(uniqueReceiverUUIDs);
    const receivers: Store[] = [];
    for (const receiver of candidates) {
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

    const now = new Date();



    ///////////////////////////////////

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
      receiverList: dto.receiverList,
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
        receiverList: [],
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
        receiverList: [],
        errors: [],
      };
      latestDeliveries.push(receiverLatest);
    }

    //Save the insertion
    const insertResult = await this.deliveryHistoryRepository.save(deliveryRecords);
    await Promise.all(latestDeliveries.map(
      latestDeli => this.latestDeliveryService.upsertLatestDelivery(latestDeli)));

    const returnResult: DeliveryHistoryRO[] = [];
    insertResult.forEach(res => {
      returnResult.push(this.mapEntityToResponseObject(res))
    })

    return returnResult;
  }

  //Update attribute of a record
  async update(id: number, dto: UpdateDeliveryHistoryDto): Promise<DeliveryHistoryRO> {
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
      const receiverErrors = validateSync(new UuidDto(dto.receiverStoreId));
      if (receiverErrors.length > 0) {
        throw new BadRequestException("Invalid receiverStoreId format!");
      }
      delivery.receiverStore = await this.storeService.findStoreByStoreId(dto.receiverStoreId);
    }

    if (dto.senderStoreId) {
      const senderErrors = validateSync(new UuidDto(dto.senderStoreId));
      if (senderErrors.length > 0) {
        throw new BadRequestException("Invalid senderStoreId format!");
      }
      delivery.senderStore = await this.storeService.findStoreByStoreId(dto.senderStoreId);
    }

    //Save the update
    const updatedRecord = await this.deliveryHistoryRepository.save(delivery);

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

    return this.mapEntityToResponseObject(updatedRecord);
  }




}
