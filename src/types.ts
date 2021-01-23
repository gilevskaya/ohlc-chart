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

export type TColorConfig = {
  bg: string;
  grid: string;
  text: string;
  //
  buy: string;
  sell: string;
  //
  position: string;
  orderBuy: string;
  orderSell: string;
};

export const COLOR_DEFAULT: TColorConfig = {
  bg: '#141414',
  grid: '#252525', // 0x1d1d1d | 010101 | 0x393939
  text: '#adadad',
  buy: '#22833d',
  sell: '#b82e40',
  position: 'blue',
  orderBuy: '#044516',
  orderSell: '#641C27',
};