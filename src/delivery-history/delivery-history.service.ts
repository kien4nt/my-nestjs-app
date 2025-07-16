import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { DeliveryHistory } from './delivery-history.entity';
import { CreateDeliveryHistoryDto } from './dto/create-delivery-history.dto';
import { UpdateDeliveryHistoryDto } from './dto/update-delivery-history.dto';
import { StoreService } from '../store/store.service';
import { LatestDeliveryService } from '../latest-delivery/latest-delivery.service';
import { LatestDelivery } from '../latest-delivery/latest-delivery.entity';
import { Store } from '../store/store.entity';
import { DeliveryHistoryRO } from './ro/delivery-history.ro';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ErrorDetail, getErrorDetail } from 'src/common/interfaces/error-detail.interface';
import { validateSync } from 'class-validator';
import { UuidDto } from 'src/common/dtos/uuid.dto';
import * as fs from 'fs-extra';
import * as path from 'path';
import { FindDeliveryHistoryDto } from './dto/find-delivery-history.dto';
import { DeliveryHistoryRelation, StoreRelation } from 'src/common/enums/relations.enum';
import { Cron } from '@nestjs/schedule';
import { time } from 'console';




@Injectable()
export class DeliveryHistoryService {

  private cachedIdMap: Map<string, number> = new Map();

  constructor(
    @InjectRepository(DeliveryHistory)
    private deliveryHistoryRepository: Repository<DeliveryHistory>,
    private readonly storeService: StoreService,
    private readonly latestDeliveryService: LatestDeliveryService,
  ) { }


  async findSendingHistoryByReceiverStoreId(dto: FindDeliveryHistoryDto): Promise<DeliveryHistoryRO[]> {
    const { receiverStoreId, page = 1, pageSize = 50 } = dto;

    const errors = validateSync(new UuidDto(receiverStoreId));
    if (errors.length > 0) {
      throw new BadRequestException('Invalid receiverStoreId provided!');
    }

    if (!this.cachedIdMap.has(receiverStoreId)) {
      const receiverStore = await this.storeService.findStoreByStoreId(receiverStoreId);
      this.cachedIdMap.set(receiverStoreId, receiverStore.id);
    }

    const offset = (page - 1) * pageSize;

    const historyRecords = await this.deliveryHistoryRepository
      .createQueryBuilder('history')
      .leftJoinAndSelect("history.senderStore", "sender")
      .where(`history.receiverList ? :storeId`, { storeId: receiverStoreId })
      .skip(offset)
      .take(pageSize)
      .getMany();


    return historyRecords.map(record => this.mapEntityToResponseObject(record));
  }



  async findReceivingHistoryByReceiverStoreId(
    dto: FindDeliveryHistoryDto,
    historyRelations: DeliveryHistoryRelation[] = [
      DeliveryHistoryRelation.SENDER_STORE
    ])
    : Promise<Record<string,DeliveryHistoryRO[]>> {
    const { receiverStoreId, page = 1, pageSize = 50 } = dto;

    const errors = validateSync(new UuidDto(receiverStoreId));
    if (errors.length > 0) {
      throw new BadRequestException('Invalid receiverStoreId provided!');
    }


    if (!this.cachedIdMap.has(receiverStoreId)) {
      const receiverStore = await this.storeService.findStoreByStoreId(receiverStoreId);
      this.cachedIdMap.set(receiverStoreId, receiverStore.id);
    }


    const offset = (page - 1) * pageSize;

    const historyRecords = await this.deliveryHistoryRepository.find({
      where: {
        receiverId: this.cachedIdMap.get(receiverStoreId),
      },
      skip: offset,
      take: pageSize,
      relations: historyRelations,
    });

    const response = historyRecords.map(record => this.mapEntityToResponseObject(record))
   

    return {[receiverStoreId]:response};
  }


  mapEntityToResponseObject(historyRecord: DeliveryHistory): DeliveryHistoryRO {
    return plainToInstance(
      DeliveryHistoryRO, historyRecord,
      {
        excludeExtraneousValues: true,
      }
    );
  }

  async deliver(dto: CreateDeliveryHistoryDto): Promise<DeliveryHistoryRO[]> {

    //Check if there is any receiver
    if (!dto.receiverList?.length) {
      throw new BadRequestException("Receiver list cannot be empty!");
    }

    const senderRelations = [
      StoreRelation.ADMIN,
      StoreRelation.LATEST_DELIVERY,
      StoreRelation.CHILD_SHOPS
    ]
    const sender = await this.storeService.findStoreByStoreId(dto.senderStoreId, senderRelations);

    //Check if sender is busy
    const senderLatestDelivery = sender.latestDelivery;
    const isSenderProceedable = !senderLatestDelivery || senderLatestDelivery.transactionStatus === false;

    //Comment this for load testing
    if (!isSenderProceedable) throw new BadRequestException('Sender is currently in a delivery process.');

    //Ensure uniqueness
    const uniqueReceiverUUIDs = [...new Set(dto.receiverList)];
    const candidateRelations = [
      StoreRelation.LATEST_DELIVERY,
      StoreRelation.ADMIN
    ]
    const candidates = await this.storeService.findStoresByStoreIdList(uniqueReceiverUUIDs, candidateRelations);
    const admin = sender.admin;
    const receivers: Store[] = [];

    //Comment the following block for load testing
    //START
    for (const receiver of candidates) {
      //Prevent self-sending and sending to different HQ
      if (receiver.id === sender.id || admin?.id !== receiver.admin?.id) {
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
    // END
    //Comment the above block for load testing

    // Uncomment this for load testing
    // candidates.map(candidate => receivers.push(candidate));

    if (!receivers.length) {
      throw new BadRequestException("Found no deliverable receivers!");
    }


    //Prepare folder name
    const adminId = admin.adminId;
    const senderStoreId = sender.storeId;
    const receiverStoreIds = receivers.map(receiver => receiver.storeId);

    //Prepare file path
    const baseDir = path.resolve(process.cwd(), '..', 'data');
    const hqPath = path.join(baseDir, adminId);
    const sourcePath = path.join(hqPath, senderStoreId);

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
      // Read the contents of the directory
      const sourceGaeUpload = path.join(sourcePath, 'gae_upload');

      // Validate source folder existence
      if (!await fs.pathExists(sourceGaeUpload)) {
        throw new BadRequestException(`Source folder "${senderStoreId}/gae_upload" does not exist at ${sourceGaeUpload}`);
      }
      if (!(await fs.lstat(sourceGaeUpload)).isDirectory()) {
        throw new BadRequestException(`Source "${senderStoreId}/gae_upload" is not a directory.`);
      }

      //Comment the following block for load testing
      //START
      const items = await fs.readdir(sourceGaeUpload);
      if (!items?.length) {
        throw new BadRequestException(`There is no items to deliver from source directory:"${senderStoreId}/gae_upload"`);
      }
      //END
      //Comment the above block for load testing

      //Iterate through receiverList
      for (const receiver of receivers) {
        const receiverStoreId = receiver.storeId;
        const destinationPath = path.join(hqPath, receiverStoreId);
        const receiverErrors: ErrorDetail[] = [];


        //Get start time of the current receiver
        const receiverStartTime = new Date();

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
            throw new BadRequestException(`Destination folder "${receiverStoreId}" does not exist. Skipping.`);

          }

          if (!(await fs.lstat(destinationPath)).isDirectory()) {
            throw new BadRequestException(`Destination "${receiverStoreId}" is not a directory. Skipping.`)
          }

          //Ensure gae_upload exists
          const destGaeUpload = path.join(destinationPath, 'gae_upload');
          await fs.ensureDir(destGaeUpload);

          // Perform the copy operation
          // `copy` recursively copies files and directories.
          // `overwrite: true` means existing files in destination will be overwritten.
          await fs.copy(sourceGaeUpload, destGaeUpload, { overwrite: true });

          //Get completed time of the current receiver 
          insertedReceiver.endDateTime = receiverLatest.endDateTime = new Date();
          console.log(`Copied content from "${senderStoreId}" to "${receiverStoreId}"`);




        } catch (error: unknown) {
          const context = `while copying content from "${senderStoreId}" to "${receiverStoreId}".`;
          const errorDetail: ErrorDetail = getErrorDetail(error, context);

          //Append error to receiver
          receiverErrors.push(errorDetail);
          insertedReceiver.errors = receiverLatest.errors = receiverErrors;

          //Get errored time of the current receiver 
          insertedReceiver.endDateTime = receiverLatest.endDateTime = new Date();
          console.log("An error occured on receiver side:", errorDetail.errorMessage);
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


      //Get completion time of sender after going through all iterations
      insertedSender.endDateTime = senderLatest.endDateTime = new Date();


    } catch (error: unknown) {

      const context = `while copying content from "${senderStoreId}"`;
      const errorDetail = getErrorDetail(error, context);
      //Append error to sender
      senderErrors.push(errorDetail);

      //Get errored time of sender
      insertedSender.endDateTime = senderLatest.endDateTime = new Date();

      console.log('An error occured on sender side:', errorDetail.errorMessage);

    }

    // Update errors if any
    if (senderErrors.length > 0) {
      insertedSender.errors = senderLatest.errors = senderErrors;
    }

    insertedSender.transactionStatus = senderLatest.transactionStatus = false;

    const updatedSender = await this.deliveryHistoryRepository.save(insertedSender);
    deliveryRecords.push(updatedSender);
    await this.latestDeliveryService.upsertLatestDelivery(senderLatest);

    return deliveryRecords.map(deliveryRecord => this.mapEntityToResponseObject(deliveryRecord));

  }



  //Update attribute of a record
  async update(id: number, dto: UpdateDeliveryHistoryDto): Promise<DeliveryHistoryRO> {
    const delivery = await this.deliveryHistoryRepository.findOne({
      where: { id },
      relations: ['senderStore', 'receiverStore'],
    });

    if (!delivery) throw new NotFoundException(`Delivery record ${id} not found.`);

    //Clean undefined value from dto
    const cleanObj = instanceToPlain(dto, {
      exposeUnsetFields: false
    })

    //Separate errors from other properties of dto
    const { errors, ...rest } = cleanObj;


    // Update provided fields from dto except errors
    Object.assign(delivery, rest);


    // If explicitly marked completed -> update endDateTime
    // Else update errors if any
    if (cleanObj.transactionStatus && cleanObj.transactionStatus === false) {
      delivery.endDateTime = new Date();
    }

    if (errors) {
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

    const receiverStoreId = cleanObj.receiverStoreId;
    const senderStoreId = cleanObj.senderStoreId;

    //Update sender, receiver if any
    if (receiverStoreId) {
      const receiverErrors = validateSync(new UuidDto(receiverStoreId));
      if (receiverErrors.length > 0) {
        throw new BadRequestException("Invalid receiverStoreId format!");
      }
      delivery.receiverStore = await this.storeService.findStoreByStoreId(receiverStoreId);
    }

    if (senderStoreId) {
      const senderErrors = validateSync(new UuidDto(senderStoreId));
      if (senderErrors.length > 0) {
        throw new BadRequestException("Invalid senderStoreId format!");
      }
      delivery.senderStore = await this.storeService.findStoreByStoreId(senderStoreId);
    }

    //Save the update
    const updatedRecord = await this.deliveryHistoryRepository.save(delivery);

    // Sync latest-delivery of the related store
    const relatedStore = updatedRecord.transactionType === 'send'
      ? delivery.senderStore
      : delivery.receiverStore;

    if (!relatedStore) throw new NotFoundException(`Store not linked in delivery #${updatedRecord.id}`);

    const latest = await this.latestDeliveryService.findLatestDeliveryOfThisStore(
      relatedStore.id,
    );

    if (latest) {
      Object.assign(latest, updatedRecord)

      await this.latestDeliveryService.upsertLatestDelivery(latest);
    }

    return this.mapEntityToResponseObject(updatedRecord);
  }


  // Schedule to run every 3 months.
  // This cron expression (0 0 1 */3 *) means:
  // - 0: at minute 0
  // - 0: at hour 0 (midnight)
  // - 1: on day-of-month 1
  // - */3: every 3rd month
  // - *: any day of the week
  // You might want to adjust the exact timing based on your needs.
  @Cron('0 0 1 */3 *',{
    timeZone: 'Asia/Ho_Chi_Minh' // Adjust the timezone as needed
  }
  )
  async handleHistoryCleanup() {
    console.log('Starting database cleanup for DeliveryHistory...');

    try {
      // Calculate the date 3 months ago
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const result = await this.deliveryHistoryRepository.delete({
        startDateTime: LessThan(threeMonthsAgo),
      });

      console.log(
        `Database cleanup for DeliveryHistory completed. Deleted ${result.affected} records older than ${threeMonthsAgo.toISOString()}.`,
      );
    } catch (error) {
      console.error('Error during database cleanup:', error.stack);
    }
  }


}
