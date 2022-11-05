import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { OrderType } from 'helpers/enums/orderType';

@Entity({ name: 'estimated_orders' })
export class EstimatedOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pair: string;

  @Column()
  side: OrderType;

  @Column()
  volume: number;

  @Column()
  estimatedPrice: number;

  @Column({ type: 'timestamp' })
  expirationDate: string;

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
