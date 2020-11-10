// @ts-ignore
import * as LWC from 'lightweight-charts';

import { TCandle, COLOR } from './';

export class Chart {
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

  addCandlestickSeries() {
    return new CandlestickSeries(this.chart);
  }
}

class CandlestickSeries {
  candlestick: LWC.ISeriesApi<'Candlestick'>;

  constructor(chart: LWC.IChartApi) {
    this.candlestick = chart.addCandlestickSeries({
      upColor: COLOR.buy,
      downColor: COLOR.sell,
      borderDownColor: COLOR.sell,
      borderUpColor: COLOR.buy,
      wickDownColor: COLOR.sell,
      wickUpColor: COLOR.buy,
    });
  }

  setData(candlesData: TCandle[]) {
    this.candlestick.setData(this.convertData(candlesData));
  }

  private convertData(candlesData: TCandle[]): LWC.BarData[] {
    // @ts-ignore
    return candlesData.map(({ timestamp, open, close, low, high }) => ({
      time: timestamp,
      open,
      close,
      low,
      high,
    }));
  }
}
