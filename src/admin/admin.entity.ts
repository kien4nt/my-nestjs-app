import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from 'typeorm';
import { Store } from '../store/store.entity';

@Entity('admin')
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({type:'uuid',unique: true})
  adminId: string;

  @Column({ type: 'text',unique: true})
  name: string;

  @Column({ type: 'text' })
  officeId: string;

  @OneToMany(() => Store, (store) => store.admin,{
    eager: false
  })
  stores: Store[];

  @Column({type:'boolean',default:true})
  isActive: boolean;
}