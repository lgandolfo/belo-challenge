import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as CryptoJS from 'crypto-js';

const createSign = (
  timeStamp: string,
  method: string,
  reqPath: string,
  body?,
): string =>
  CryptoJS.enc.Base64.stringify(
    CryptoJS.HmacSHA256(
      timeStamp + method + reqPath + (body ? JSON.stringify(body) : ''),
      process.env.SECRETKEY,
    ),
  );

export const getOrderBooks = async (pair: string): Promise<AxiosResponse> => {
  const config: AxiosRequestConfig = {
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      'x-simulated-trading': 1,
    },
  };
  const { data } = await axios.get(
    `${process.env.OKX_BASE_URL}/market/books?sz=200&instId=${pair}`,
    config,
  );
  return data;
};

export const placeOrder = async (body): Promise<AxiosResponse> => {
  const timeStamp = new Date().toISOString();
  const sign = createSign(timeStamp, 'POST', `/api/v5/trade/order`, body);
  const config = {
    headers: {
      'OK-ACCESS-KEY': process.env.APIKEY,
      'OK-ACCESS-PASSPHRASE': process.env.PASSPHRASE,
      'content-type': 'application/json',
      accept: 'application/json',
      'x-simulated-trading': 1,
      'OK-ACCESS-TIMESTAMP': timeStamp,
      'OK-ACCESS-SIGN': sign,
    },
  };
  const { data } = await axios.post(
    `${process.env.OKX_BASE_URL}/trade/order`,
    body,
    config,
  );
  return data;
};

export const getAveragePrice = async (
  pair: string,
  orderId: string,
): Promise<number> => {
  const timeStamp = new Date().toISOString();
  const sign = createSign(
    timeStamp,
    'GET',
    `/api/v5/trade/order?instId=${pair}&ordId=${orderId}`,
  );
  const config = {
    headers: {
      'OK-ACCESS-KEY': process.env.APIKEY,
      'OK-ACCESS-PASSPHRASE': process.env.PASSPHRASE,
      'content-type': 'application/json',
      accept: 'application/json',
      'x-simulated-trading': 1,
      'OK-ACCESS-TIMESTAMP': timeStamp,
      'OK-ACCESS-SIGN': sign,
    },
  };
  const { data } = await axios.get(
    `${process.env.OKX_BASE_URL}/trade/order?instId=${pair}&ordId=${orderId}`,
    config,
  );
  return +data.data[0].avgPx;
};
