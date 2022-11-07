import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';

import { OrderBooks, PlaceOrder, PlaceOrderBody } from '../../helpers/okx';
import { OrderType } from '../../helpers/enums/orderType';
import { calculateFees, priceEstimation } from '../../helpers/price';
import { badRequestExceptionResponse } from '../../helpers/responses';

import { getAveragePrice, getOrderBooks, placeOrder } from '../../services/okx';
import { EstimatedOrder } from '../entities/expectedOrder.entity';
import { PlacedOrder } from '../entities/placedOrder.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(EstimatedOrder)
    private estimatedOrderRepository: Repository<EstimatedOrder>,
    @InjectRepository(PlacedOrder)
    private placedOrderRepository: Repository<PlacedOrder>,
    private configService: ConfigService,
  ) {}
  async getOrderBooks(pair: string): Promise<OrderBooks> {
    const result = await getOrderBooks(pair);
    return result.data[0];
  }

  validateSide(pair): void {
    if (![OrderType.BUY.toString(), OrderType.SELL.toString()].includes(pair))
      throw badRequestExceptionResponse(
        'Invalid side, please use buy or sell.',
      );
  }

  generateEstimationExpiration(): Date {
    const expiration = parseInt(
      this.configService.get<string>('EXPIRATION_TIME_IN_SECONDS'),
      10,
    );
    const date = new Date();
    date.setSeconds(date.getSeconds() + expiration);
    return date;
  }

  async estimatePrice(
    pair: string,
    side: OrderType,
    volume: number,
  ): Promise<{
    estimatedPrice: number;
    expirationDate: Date;
    orderId: number;
  }> {
    this.validateSide(side);
    const orderBooks: OrderBooks = await this.getOrderBooks(pair);
    if (!orderBooks) {
      throw badRequestExceptionResponse(
        'Could not get estimated price, please check that the entered pair is correct.',
      );
    }
    const estimatedPrice: number = priceEstimation(volume, side, orderBooks);
    if (!estimatedPrice) {
      throw badRequestExceptionResponse(
        'Could not estimate price. Please, verify the entered volume',
      );
    }
    const expirationDate: Date = this.generateEstimationExpiration();
    const estimatedOrder = await this.estimatedOrderRepository.save({
      pair: pair,
      side: side,
      volume: volume,
      estimatedPrice: parseFloat(estimatedPrice.toFixed(5)),
      expirationDate,
    });

    return {
      estimatedPrice: estimatedOrder.estimatedPrice,
      expirationDate: estimatedOrder.expirationDate,
      orderId: estimatedOrder.id,
    };
  }

  async createOrder(body: PlaceOrderBody): Promise<PlaceOrder> {
    const {
      data: [order],
    } = await placeOrder(body);
    if (!order.ordId) throw badRequestExceptionResponse(order.sMsg);
    return order;
  }

  async placeOrder(orderId: number): Promise<{
    estimatedPrice: number;
    placedOrderPrice: number;
  }> {
    if (!orderId || orderId <= 0)
      throw badRequestExceptionResponse(
        'Invalid order id, please provide a valid one.',
      );
    const estimatedOrder = await this.estimatedOrderRepository.findOne({
      where: { id: orderId },
    });
    if (!estimatedOrder) {
      throw badRequestExceptionResponse(
        'Order not found with the provided id.',
      );
    } else if (new Date(estimatedOrder.expirationDate) < new Date()) {
      throw badRequestExceptionResponse(
        'This order is expired, please create a new estimation.',
      );
    }

    const placeOrderBody: PlaceOrderBody = {
      instId: estimatedOrder.pair,
      tdMode: 'cash',
      side: estimatedOrder.side,
      ordType: 'market',
      sz: estimatedOrder.volume.toString(),
      tgtCcy: 'base_ccy',
    };
    const placedOrder: PlaceOrder = await this.createOrder(placeOrderBody);

    const averagePrice = await getAveragePrice(
      estimatedOrder.pair,
      placedOrder.ordId,
    );
    const finalPrice = calculateFees(estimatedOrder.side, averagePrice);

    const savedOrder = await this.placedOrderRepository.save({
      estimatedOrderId: estimatedOrder.id,
      okexOrderId: placedOrder.ordId,
      estimatedPrice: +estimatedOrder.estimatedPrice,
      placedPrice: finalPrice,
    });
    return {
      estimatedPrice: savedOrder.estimatedPrice,
      placedOrderPrice: savedOrder.placedPrice,
    };
  }
}
