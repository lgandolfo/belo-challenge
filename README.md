## Install

```
npm install
docker-compose -f docker-compose.yml up --build
```

## Run the app

```
docker-compose -f docker-compose.yml up
```

## Run the tests

```
npm run test:e2e
```

## Environment Variables

```
DB_HOST_URL=
DB_PORT=
DB_USER=
DB_USER_PASSWORD=
DB_NAME=
OKX_BASE_URL=https://www.okx.com/api/v5
APIKEY=
SECRETKEY=
PASSPHRASE=
EXPIRATION_TIME_IN_SECONDS=60
FEE=0.001
SPREAD=0.001
```

## Endpoints

### Estimate price
```
POST /orders/estimate-price
const body = {
  pair: "BTC-USDT",
  side: "buy" | "sell",
  volume: 1
}
```

### Place order
```
POST /orders/place-order
const body = {
  orderId: 1
}
```
