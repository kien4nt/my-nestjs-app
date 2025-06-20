import { DeliveryStatus } from './../../common/enums/delivery-status.enum';
import {ErrorDetail} from '../../common/interfaces/error-detail.interface';
import { Expose, Transform } from 'class-transformer';
import { TransactionType } from 'src/common/enums/transaction-type.enum';
import {format} from 'date-fns';


export class DeliveryHistoryRO {
    @Expose()
    id: number;

    @Expose()
    @Transform(({ value }) => value ? format(new Date(value), 'yyyy-MM-dd HH:mm:ss') : undefined)
    startDateTime: string; 

    @Expose()
    @Transform(({ value }) => value ? format(new Date(value), 'yyyy-MM-dd HH:mm:ss') : undefined)
    endDateTime: string;

    @Expose()
    @Transform(
        ({obj}) => obj.receiverStore?.storeId
    )
    receiverStoreId: string;

    @Expose()
    @Transform(
        ({obj}) => obj.senderStore?.storeId
    )
    senderStoreId: string;
    
    @Expose()
    @Transform(
        ({obj}) => obj.transactionStatus === false 
        ? DeliveryStatus.COMPLETED
        : obj.errors?.length
        ? DeliveryStatus.ERRORED
        : DeliveryStatus.IN_PROGRESS
    )
    deliveryStatus: DeliveryStatus;
    
    @Expose()
    transactionType: TransactionType;
    
    @Expose()
    @Transform(
        ({obj}) => obj.transactionType === 'send' ? obj.receiverList : undefined
    )
    receiverList: string[];
    
    @Expose()
    @Transform(
        ({obj}) => obj.errors?.length ? obj.errors : undefined
    )
    errors: ErrorDetail[]; 
}