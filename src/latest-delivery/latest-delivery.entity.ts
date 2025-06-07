import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Store } from '../store/store.entity';
import {ErrorDetail} from '../common/interfaces/error-detail.interface';


@Entity('LatestDelivery')
export class LatestDelivery {
    // Since storeIdPK is the primary key and also references Store's ID,
    // we use @PrimaryColumn and @OneToOne with @JoinColumn.
    @PrimaryColumn()
    storeIdPK: number

    @OneToOne(
        () => Store, (store) => store.latestDelivery, {
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'storeIdPK', referencedColumnName: 'id' })
    store: Store;


    @Column({ type: 'timestamp' })
    startDateTime: Date;

    @Column({ type: 'timestamp' })
    endDateTime: Date;

    @Column({ type: 'text', enum: ['send', 'receive'] })
    transactionType: string;

    @Column({ type: 'boolean' })
    transactionStatus: boolean;

    @Column({ type: 'jsonb' })
    receiverList: object;

    @Column({ type: 'jsonb', nullable: true, default: [] })
    errors: ErrorDetail[];
}