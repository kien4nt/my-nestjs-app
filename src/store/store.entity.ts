import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Admin } from '../admin/admin.entity';
import { DeliveryHistory } from '../delivery-history/delivery-history.entity';
import { LatestDelivery } from '../latest-delivery/latest-delivery.entity';

@Entity('store')
@Index(['storeName', 'storeCode', 'storeNameCode'], { unique: true })
export class Store {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type: "uuid",unique: true})
  storeId: string;

  @Column({ type: 'text' })
  storeName: string;

  @Column({ type: 'text' })
  storeCode: string;

  //Concatenation of storeName and storeCode
  @Column({type: 'text'})
  storeNameCode: string;

  @Column({ type: 'text' })
  password: string;

  //storeName != storename
  @Column({ type: 'text',unique: true})
  storename: string;


  //Start Admin - Store relationship
  @ManyToOne(
    () => Admin, (admin) => admin.stores, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'adminIdPK', referencedColumnName: 'id' })
  admin: Admin;
  //End Admin - Store relationship


  @Column({ type: 'text', enum: ['group', 'shop'] })
  storeType: string;


  //Start of Group - Shops relationship
  @OneToMany(
    () => Store, (store) => store.parentGroup, {
    eager: false, // Don't load automatically by default
    cascade: ['insert', 'update'], // Adding a shop to the array will result in updating the shop's parentGroupId to this group's id
  })
  childShops: Store[]; // Group's property (Group mananges shops)

  @ManyToOne(
    () => Store, (store) => store.childShops, {
    nullable: true, // Allow a store to not have a parent group
    onDelete: 'SET NULL', // When a parent Store is deleted, set parentGroupId to NULL
  })
  @JoinColumn({ name: 'parentGroupId', referencedColumnName: 'id' })
  parentGroup: Store; //Shop's property (A shop is managed by a group)
  // End of Group - Shops relationship


  @OneToMany(
    () => DeliveryHistory, (deliveryHistory) => deliveryHistory.receiverStore, {
    eager: false, // Don't load automatically by default
  })
  receivedDeliveries: DeliveryHistory[];

  @OneToMany(
    () => DeliveryHistory, (deliveryHistory) => deliveryHistory.senderStore, {
    eager: false, // Don't load automatically by default
  })
  sentDeliveries: DeliveryHistory[];

  @OneToOne(
    () => LatestDelivery, (latestDelivery) => latestDelivery.store, {
    eager: false, // Don't load automatically by default
  })
  latestDelivery: LatestDelivery;
}