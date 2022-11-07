import { Body, Controller, Post } from '@nestjs/common';

import { Response, successResponse } from '../../helpers/responses';
import { OrderType } from '../../helpers/enums/orderType';

import { OrdersService } from '../services/orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('/estimate-price')
  async getEstimatedPrice(
    @Body()
    { pair, side, volume }: { pair: string; side: OrderType; volume: number },
  ): Promise<Response> {
    const estimatedOrder = await this.ordersService.estimatePrice(
      pair,
      side,
      volume,
    );
    return successResponse({
      estimatedOrder,
      message: 'Order estimated successfully',
    });
  }

  @Post('/place-order')
  async placeOrder(
    @Body() { orderId }: { orderId: number },
  ): Promise<Response> {
    const order = await this.ordersService.placeOrder(orderId);
    return successResponse({
      order,
      message: 'Order estimated successfully',
    });
  }
}
