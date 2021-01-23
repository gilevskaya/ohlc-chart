import * as LWC from 'lightweight-charts';

import {
  TChartCandle,
  TColorConfig,
  TChartOrder,
  COLOR_DEFAULT,
} from './types';

export function create(element: HTMLDivElement, colorConfig = {}) {
  if (!element) throw new Error('Chart html element is null');
  const color = {
    bg: '#141414',
    grid: '#252525', // 0x1d1d1d | 010101 | 0x393939
    text: '#adadad',
    ...colorConfig,
  };

  const [width, height] = [element.clientWidth, element.clientHeight];
  const chart = LWC.createChart(element, {
    width,
    height,
    crosshair: {
      mode: LWC.CrosshairMode.Normal,
    },
    layout: {
      backgroundColor: color.bg,
      textColor: color.text,
    },
    grid: {
      vertLines: {
        color: color.grid,
      },
      horzLines: {
        color: color.grid,
      },
    },
    rightPriceScale: {
      borderColor: color.grid,
    },
    timeScale: {
      borderColor: color.grid,
      rightBarStaysOnScroll: true,
      visible: true,
      timeVisible: true,
      secondsVisible: true,
    },
  });
  const series = new Map<string, any>();

  const setOhlcData = (candlesData: TChartCandle[]) => {
    const ohlcSeries = series.get('ohlc');
    if (!ohlcSeries) throw new Error('Chart has no ohlc series');
    const cd = candlesData.map(convertData);
    ohlcSeries.setData(cd);
  };

  return {
    addOhlc: (candlesData: TChartCandle[], colorConfig = {}) => {
      const colorOhlc = {
        buy: '#22833d',
        sell: '#b82e40',
        ...colorConfig,
      };
      const ohlcSeries = chart.addCandlestickSeries({
        upColor: colorOhlc.buy,
        downColor: colorOhlc.sell,
        borderDownColor: colorOhlc.sell,
        borderUpColor: colorOhlc.buy,
        wickDownColor: colorOhlc.sell,
        wickUpColor: colorOhlc.buy,
      });
      if (candlesData.length > 0) setOhlcData(candlesData);
      series.set('ohlc', ohlcSeries);
    },
    setOhlcData,
  };
}

function convertData({ t, o, c, l, h }: TChartCandle): LWC.BarData {
  // @ts-ignore
  return { time: t, open: o, close: c, low: l, high: h };
}

/////////////////////

export class ChartOld {
  width: number;
  height: number;
  chart: LWC.IChartApi;
  colorConfig: TColorConfig;
  //
  candles: OhlcSeries | null = null;
  position: LWC.IPriceLine | null = null;
  orders: Map<string, { c: LWC.IPriceLine; d: TChartOrder }> = new Map();

  constructor(
    element: HTMLDivElement,
    colorConfig: Partial<TColorConfig> = {}
  ) {
    [this.width, this.height] = [element.clientWidth, element.clientHeight];
    this.colorConfig = {
      ...COLOR_DEFAULT,
      ...colorConfig,
    };

    this.chart = LWC.createChart(element, {
      width: this.width,
      height: this.height,
      crosshair: {
        mode: LWC.CrosshairMode.Normal,
      },
      layout: {
        backgroundColor: this.colorConfig.bg,
        textColor: this.colorConfig.text,
      },
      grid: {
        vertLines: {
          color: this.colorConfig.grid,
        },
        horzLines: {
          color: this.colorConfig.grid,
        },
      },
      rightPriceScale: {
        borderColor: this.colorConfig.grid,
      },
      timeScale: {
        borderColor: this.colorConfig.grid,
        rightBarStaysOnScroll: true,
        visible: true,
        timeVisible: true,
        secondsVisible: true,
      },
    });

    const ro = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      if (entries.length !== 1) return;
      let entry = entries[0];
      let { blockSize: height, inlineSize: width } = entry.contentBoxSize[0];
      if (this.chart != null) {
        this.chart.resize(width, height);
      }
    });
    ro.observe(element);
  }

  setCandles(data: TChartCandle[]) {
    if (!this.candles) {
      this.candles = new OhlcSeries(this, this.colorConfig);
    }
    this.candles.setData(data);
  }

  setPosition(price: number | null) {
    if (!this.candles) return;
    if (this.position) this.candles.removePriceLine(this.position);
    if (price != null) {
      this.candles.setPriceLine(price, this.colorConfig.position);
    }
  }

  setOrders(orders: TChartOrder[]) {
    const updOrders = new Map();
    orders.forEach(o => {
      if (!this.candles) return;
      const existingOrder = this.orders.get(o.id);
      if (existingOrder) this.orders.delete(o.id);
      if (!existingOrder) {
        // add order
        const pl = this.candles.setPriceLine(
          o.price,
          o.size > 0 ? this.colorConfig.buy : this.colorConfig.sell
        );
        updOrders.set(o.id, { c: pl, d: o });
      } else if (existingOrder.d.price !== o.price) {
        // update order
        this.candles.removePriceLine(existingOrder.c);
        const pl = this.candles.setPriceLine(
          o.price,
          o.size > 0 ? this.colorConfig.buy : this.colorConfig.sell
        );
        updOrders.set(o.id, { c: pl, d: o });
      } // if exists and prices are the same - do nothing
    });
    this.orders.forEach(v => this.candles?.removePriceLine(v.c));
    this.orders = updOrders;
  }
}

export class OhlcSeries {
  ohlcSeries: LWC.ISeriesApi<'Candlestick'>;
  candlesData: LWC.BarData[] = [];

  constructor(chart: ChartOld, colorConfig: TColorConfig) {
    this.ohlcSeries = chart.chart.addCandlestickSeries({
      upColor: colorConfig.buy,
      downColor: colorConfig.sell,
      borderDownColor: colorConfig.sell,
      borderUpColor: colorConfig.buy,
      wickDownColor: colorConfig.sell,
      wickUpColor: colorConfig.buy,
    });
  }

  setData(candlesData: TChartCandle[]) {
    this.candlesData = candlesData.map(this.convertData);
    this.ohlcSeries.setData(this.candlesData);
  }

  setPriceLine(price: number, color: string) {
    // @ts-ignore
    return this.ohlcSeries.createPriceLine({
      price,
      color: color,
      lineWidth: 2,
      lineStyle: LWC.LineStyle.Dashed,
      axisLabelVisible: true,
    });
  }

  removePriceLine(priceLine: LWC.IPriceLine) {
    this.ohlcSeries.removePriceLine(priceLine);
  }

  private convertData({ t, o, c, l, h }: TChartCandle): LWC.BarData {
    return {
      // @ts-ignore
      time: t,
      open: o,
      close: c,
      low: l,
      high: h,
    };
  }
}
