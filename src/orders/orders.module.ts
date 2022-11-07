import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrdersController } from './controllers/orders.controller';
import { EstimatedOrder } from './entities/expectedOrder.entity';
import { PlacedOrder } from './entities/placedOrder.entity';
import { OrdersService } from './services/orders.service';

@Module({
  controllers: [OrdersController],
  exports: [OrdersService],
  imports: [TypeOrmModule.forFeature([EstimatedOrder, PlacedOrder])],
  providers: [OrdersService],
})
export class OrdersModule {}
