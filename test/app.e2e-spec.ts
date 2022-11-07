import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';

import { OrdersModule } from './../src/orders/orders.module';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { EstimatedOrder } from '../src/orders/entities/expectedOrder.entity';
import { PlacedOrder } from '../src/orders/entities/placedOrder.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let orderId: number;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: parseInt(process.env.DB_PORT, 10),
          username: process.env.DB_USER,
          password: process.env.DB_USER,
          database: 'challenge-test',
          entities: [EstimatedOrder, PlacedOrder],
          synchronize: true,
        }),
        OrdersModule,
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/orders/estimate-price (POST)', () => {
    it('Create estimation successfully', () => {
      return request(app.getHttpServer())
        .post('/orders/estimate-price')
        .send({
          pair: 'BTC-USDT',
          side: 'buy',
          volume: 0.01,
        })
        .expect(201)
        .then((response) => {
          expect(JSON.parse(response.text)).toEqual({
            estimatedOrder: {
              estimatedPrice: expect.any(Number),
              expirationDate: expect.any(String),
              orderId: expect.any(Number),
            },
            message: 'Order estimated successfully',
            success: true,
          });
          orderId = JSON.parse(response.text).estimatedOrder.orderId;
        });
    });

    it('Create estimation failed without pair', () => {
      return request(app.getHttpServer())
        .post('/orders/estimate-price')
        .send({
          side: 'buy',
          volume: 0.01,
        })
        .expect(400)
        .then((response) => {
          expect(JSON.parse(response.text)).toEqual({
            error: 'Bad request',
            message:
              'Could not get estimated price, please check that the entered pair is correct.',
            success: false,
            statusCode: 400,
          });
        });
    });

    it('Create estimation failed without side', () => {
      return request(app.getHttpServer())
        .post('/orders/estimate-price')
        .send({
          pair: 'BTC-USDT',
          volume: 0.01,
        })
        .expect(400)
        .then((response) => {
          expect(JSON.parse(response.text)).toEqual({
            error: 'Bad request',
            message: 'Invalid side, please use buy or sell.',
            success: false,
            statusCode: 400,
          });
        });
    });

    it('Create estimation failed without volume', () => {
      return request(app.getHttpServer())
        .post('/orders/estimate-price')
        .send({
          pair: 'BTC-USDT',
          side: 'buy',
        })
        .expect(400)
        .then((response) => {
          expect(JSON.parse(response.text)).toEqual({
            error: 'Bad request',
            message:
              'Could not estimate price. Please, verify the entered volume',
            success: false,
            statusCode: 400,
          });
        });
    });

    it('Create estimation failed with too high volumen', () => {
      return request(app.getHttpServer())
        .post('/orders/estimate-price')
        .send({
          pair: 'BTC-USDT',
          side: 'buy',
          volume: 10000000000,
        })
        .expect(400)
        .then((response) => {
          expect(JSON.parse(response.text)).toEqual({
            error: 'Bad request',
            message:
              'Could not estimate price for the current volume, please try agin with other amount.',
            success: false,
            statusCode: 400,
          });
        });
    });
  });

  describe('/orders/place-order (POST)', () => {
    it('Place order successfully', () => {
      return request(app.getHttpServer())
        .post('/orders/place-order')
        .send({
          orderId,
        })
        .expect(201)
        .then((response) => {
          expect(JSON.parse(response.text)).toEqual({
            order: {
              estimatedPrice: expect.any(Number),
              placedOrderPrice: expect.any(Number),
            },
            message: 'Order estimated successfully',
            success: true,
          });
        });
    });

    it('Place order failed with invalid order id', () => {
      return request(app.getHttpServer())
        .post('/orders/place-order')
        .send({
          orderId: 0,
        })
        .expect(400)
        .then((response) => {
          expect(JSON.parse(response.text)).toEqual({
            error: 'Bad request',
            message: 'Invalid order id, please provide a valid one.',
            success: false,
            statusCode: 400,
          });
        });
    });

    it('Place order failed with order does not exist', () => {
      return request(app.getHttpServer())
        .post('/orders/place-order')
        .send({
          orderId: 10000,
        })
        .expect(400)
        .then((response) => {
          expect(JSON.parse(response.text)).toEqual({
            error: 'Bad request',
            message: 'Order not found with the provided id.',
            success: false,
            statusCode: 400,
          });
        });
    });

    it('Place order failed with estimation expired', () => {
      return request(app.getHttpServer())
        .post('/orders/place-order')
        .send({
          orderId: 1,
        })
        .expect(400)
        .then((response) => {
          expect(JSON.parse(response.text)).toEqual({
            error: 'Bad request',
            message: 'This order is expired, please create a new estimation.',
            success: false,
            statusCode: 400,
          });
        });
    });
  });
});
