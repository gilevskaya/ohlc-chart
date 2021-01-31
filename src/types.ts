export type TChartCandle = {
  t: number | string;
  o: number;
  h: number;
  l: number;
  c: number;
};

export enum LineStyle {
  Solid = 0,
  Dotted = 1,
  Dashed = 2,
  LargeDashed = 3,
  SparseDotted = 4,
}

export type TChartLine = {
  price: number;
} & Partial<{
  title: string;
  color: string;
  lineWidth: number; // 1 | 2 | 3 | 4;
  lineStyle: LineStyle;
  axisLabelVisible: boolean;
}>;

export type TColorConfig = {
  bg: string;
  grid: string;
  text: string;
  //
  buy: string;
  sell: string;
};

export const COLOR_DEFAULT: TColorConfig = {
  bg: '#141414',
  grid: '#252525', // 0x1d1d1d | 010101 | 0x393939
  text: '#adadad',
  buy: '#22833d',
  sell: '#b82e40',
};

// buy: "#22833D",
// "buy-dark": "#044516",
// sell: "#B82E40",
// "sell-dark": "#48141C",
// accent: "#0666b7",
