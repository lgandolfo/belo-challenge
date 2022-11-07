export interface OrderBooks {
  asks: Record<string, unknown>;
  bids: Record<string, unknown>;
  ts: string;
}

export interface PlaceOrder {
  clOrdId: string;
  ordId: string;
  tag: string;
  sCode: string;
  sMsg: string;
}

export interface PlaceOrderBody {
  instId: string;
  tdMode: string;
  side: string;
  ordType: string;
  sz: string;
  tgtCcy: string;
}
