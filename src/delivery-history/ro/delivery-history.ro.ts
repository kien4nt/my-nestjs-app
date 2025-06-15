import {ErrorDetail} from '../../common/interfaces/error-detail.interface';
import { Expose, Transform } from 'class-transformer';

export class DeliveryHistoryRO {
    @Expose()
    id: number;

    @Expose()
    startDateTime: Date;

    @Expose()
    endDateTime: Date;

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
    transactionStatus: boolean;
    
    @Expose()
    transactionType: string;
    
    @Expose()
    receiverList: object;
    
    @Expose()
    errors: ErrorDetail[]; 
}