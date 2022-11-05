import { Controller, Get } from '@nestjs/common';

import { OrdersService } from '../services/orders.service';

@Controller()
export class AppController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  getHello(): string {
    return 'Hello';
  }
}
