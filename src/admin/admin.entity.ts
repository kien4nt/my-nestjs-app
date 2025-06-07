import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Store } from '../store/store.entity';

@Entity('admin')
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({unique: true})
  adminId: string;

  @Column({ type: 'text', unique: true })
  name: string;

  @Column({ type: 'text' })
  officeId: string;

  @OneToMany(() => Store, (store) => store.admin)
  stores: Store[];
}