// @ts-ignore
import * as LWC from 'lightweight-charts';

import { TChartCandle, TChartOrder, COLOR } from './';

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
  postition: LWC.IPriceLine | null = null;
  orders: Map<string, LWC.IPriceLine> = new Map();

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

  setData(candlesData: TChartCandle[]) {
    this.candlesData = candlesData.map(this.convertData);
    this.ohlcSeries.setData(this.candlesData);
  }

  updateLastCandle(newCandle: TChartCandle) {
    this.candlesData.pop();
    this.candlesData.push(this.convertData(newCandle));
    this.ohlcSeries.update(this.convertData(newCandle));
  }

  addLastCandle(newCandle: TChartCandle) {
    this.candlesData.push(this.convertData(newCandle));
    this.ohlcSeries.update(this.convertData(newCandle));
  }

  setPosition(price: number | null) {
    if (this.postition) {
      this.ohlcSeries.removePriceLine(this.postition);
    }
    if (price != null) {
      this.postition = this.ohlcSeries.createPriceLine({
        price,
        color: COLOR.position,
        lineWidth: 1,
        lineStyle: LWC.LineStyle.Solid,
        axisLabelVisible: true,
      });
    }
  }

  setOrders(orders: TChartOrder[]) {
    const updOrders = new Map();
    orders.forEach(oData => {
      const { id, price, size } = oData;
      const existingOrderPL = this.orders.get(id);
      if (existingOrderPL) {
        this.ohlcSeries.removePriceLine(existingOrderPL);
      }
      updOrders.set(
        id,
        this.ohlcSeries.createPriceLine({
          price,
          color: size > 0 ? COLOR.orderBuy : COLOR.orderSell,
          lineWidth: 2,
          lineStyle: LWC.LineStyle.Dashed,
          axisLabelVisible: true,
        })
      );
    });
    this.orders = updOrders;
  }

  private convertData({
    timestamp,
    open,
    close,
    low,
    high,
  }: TChartCandle): LWC.BarData {
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
