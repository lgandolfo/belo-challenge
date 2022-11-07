import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { OrderType } from '../../helpers/enums/orderType';

@Entity({ name: 'estimated_orders' })
export class EstimatedOrder {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  pair: string;

  @Column()
  side: OrderType;

  @Column({ type: 'decimal', scale: 5 })
  volume: number;

  @Column({ type: 'decimal', scale: 5 })
  estimatedPrice: number;

  @Column({ type: 'timestamp' })
  expirationDate: Date;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
