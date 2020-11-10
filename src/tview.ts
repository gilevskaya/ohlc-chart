// @ts-ignore
import * as LWC from 'lightweight-charts';

import { TCandle, COLOR } from './';

export class ChartOld {
  widht: number;
  height: number;
  chart: LWC.IChartApi;

  constructor(element: HTMLDivElement) {
    [this.widht, this.height] = [element.clientWidth, element.clientHeight];

    this.chart = LWC.createChart(element, {
      width: this.widht,
      height: this.height,
      crosshair: {
        mode: LWC.CrosshairMode.Normal,
      },
      layout: {
        backgroundColor: COLOR.bg,
        textColor: COLOR.text,
      },
      grid: {
        vertLines: {
          color: COLOR.grid,
        },
        horzLines: {
          color: COLOR.grid,
        },
      },
      rightPriceScale: {
        borderColor: COLOR.grid,
      },
      timeScale: {
        borderColor: COLOR.grid,
        rightBarStaysOnScroll: true,
        visible: true,
        timeVisible: true,
        secondsVisible: true,
      },
    });
  }

  addOHLCSeries() {
    return new OHLCSeries(this.chart);
  }
}

export class OHLCSeries {
  ohlcSeries: LWC.ISeriesApi<'Candlestick'>;
  candlesData: LWC.BarData[] = [];

  constructor(chart: LWC.IChartApi) {
    this.ohlcSeries = chart.addCandlestickSeries({
      upColor: COLOR.buy,
      downColor: COLOR.sell,
      borderDownColor: COLOR.sell,
      borderUpColor: COLOR.buy,
      wickDownColor: COLOR.sell,
      wickUpColor: COLOR.buy,
    });
  }

  setData(candlesData: TCandle[]) {
    this.candlesData = candlesData.map(this.convertData);
    this.ohlcSeries.setData(this.candlesData);
  }

  updateLastCandle(newCandle: TCandle) {
    this.candlesData.pop();
    this.candlesData.push(this.convertData(newCandle));
    this.ohlcSeries.update(this.convertData(newCandle));
  }

  addLastCandle(newCandle: TCandle) {
    this.candlesData.push(this.convertData(newCandle));
    this.ohlcSeries.update(this.convertData(newCandle));
  }

  private convertData({
    timestamp,
    open,
    close,
    low,
    high,
  }: TCandle): LWC.BarData {
    return {
      // @ts-ignore
      time: timestamp,
      open,
      close,
      low,
      high,
    };
  }
}
