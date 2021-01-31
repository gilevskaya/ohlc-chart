export type TChartCandle = {
  t: number | string;
  o: number;
  h: number;
  l: number;
  c: number;
};

export type TChartOrder = {
  id: string;
  size: number; // negarive if sell
  price: number;
};

export type TChartPosition = {
  size: number;
  price: number;
};

export type TColorConfig = {
  bg: string;
  grid: string;
  text: string;
  //
  buy: string;
  sell: string;
  //
  position: string;
  liquidation: string;
  orderBuy: string;
  orderSell: string;
  orderPending: string;
};

export const COLOR_DEFAULT: TColorConfig = {
  bg: '#141414',
  grid: '#252525', // 0x1d1d1d | 010101 | 0x393939
  text: '#adadad',
  buy: '#22833d',
  sell: '#b82e40',
  position: '#0666b7',
  liquidation: '#b82e40',
  orderBuy: '#044516',
  orderSell: '#48141C',
  orderPending: '#c8c8c8',
};

// buy: "#22833D",
// "buy-dark": "#044516",
// sell: "#B82E40",
// "sell-dark": "#48141C",
// accent: "#0666b7",
