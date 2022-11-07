import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'placed_orders' })
export class PlacedOrder {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column()
  estimatedOrderId: number;

  @Column()
  okexOrderId: string;

  @Column({ type: 'decimal', scale: 5 })
  estimatedPrice: number;

  @Column({ type: 'decimal', scale: 5 })
  placedPrice: number;

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
