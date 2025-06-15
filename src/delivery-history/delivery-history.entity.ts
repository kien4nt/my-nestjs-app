import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Store } from '../store/store.entity';
import {ErrorDetail} from '../common/interfaces/error-detail.interface';

@Entity('delivery_history')
export class DeliveryHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'timestamp' })
    startDateTime: Date;

    @Column({ type: 'timestamp' })
    endDateTime: Date;

    //Start of Store as receiver relationship
    @Index()
    @ManyToOne(
        () => Store, (store) => store.receivedDeliveries, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'receiverId', referencedColumnName: 'id' })
    receiverStore: Store;
    //End of Store as receiver relationship


    //Start of Store as sender relationship
    @ManyToOne(
        () => Store, (store) => store.sentDeliveries, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'senderId', referencedColumnName: 'id' })
    senderStore: Store;
    // End of Store as sender relationship


    @Column({ type: 'boolean' })
    transactionStatus: boolean;

    @Column({ type: 'text', enum: ['send', 'receive'] })
    transactionType: string;

    @Column({ type: 'jsonb',nullable: true})
    receiverList: object;

    @Column({ type: 'jsonb', nullable: true, default: [] }) 
    errors: ErrorDetail[]; 
}