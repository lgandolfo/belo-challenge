import { OrderType } from './enums/orderType';
import { OrderBooks } from './okx';
import { badRequestExceptionResponse } from './responses';

export const priceEstimation = (
  volume: number,
  side: OrderType,
  orderBooks: OrderBooks,
) => {
  const orderBook = side === 'buy' ? orderBooks.asks : orderBooks.bids;
  const priceWithVolume = [];
  let volumeSum = 0;
  for (let i = 0; volumeSum < volume; i++) {
    if (i === orderBook.length)
      throw badRequestExceptionResponse(
        'Could not estimate price for the current volume, please try agin with other amount.',
      );

    if (volumeSum + +orderBook[i][1] > volume) {
      const restVolumne = volume - volumeSum;
      priceWithVolume.push([+orderBook[i][0], restVolumne]);
      break;
    } else {
      priceWithVolume.push([+orderBook[i][0], +orderBook[i][1]]);
      volumeSum += +orderBook[i][1];
    }
  }
  const averagePrice =
    priceWithVolume.reduce(
      (previousValue, currentValue) =>
        previousValue + currentValue[0] * currentValue[1],
      0,
    ) / volume;
  const priceWithFeeds = calculateFees(side, averagePrice);
  return priceWithFeeds;
};

export const calculateFees = (side: 'buy' | 'sell', price: number): number => {
  let fee;
  let spread;
  if (side === 'buy') {
    fee = 1 + +process.env.FEE;
    spread = 1 + +process.env.SPREAD;
  } else {
    fee = 1 - +process.env.FEE;
    spread = 1 - +process.env.SPREAD;
  }

  return price * fee * spread;
};
