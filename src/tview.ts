import * as LWC from 'lightweight-charts';

import { TChartLine, TChartCandle, TColorConfig, COLOR_DEFAULT } from './types';

export class ChartOld {
  width: number;
  height: number;
  chart: LWC.IChartApi;
  colorConfig: TColorConfig;
  //
  ohlc: LWC.ISeriesApi<'Candlestick'> | null = null;
  position: LWC.IPriceLine | null = null;
  liquidation: LWC.IPriceLine | null = null;
  openOrders: Map<string, LWC.IPriceLine> = new Map();
  pendingOrders: Array<LWC.IPriceLine> = [];
  //
  priceSelectHandler: null | LWC.MouseEventHandler = null;

  constructor(
    wrapperElement: HTMLDivElement,
    colorConfig: Partial<TColorConfig> = {}
  ) {
    let element = document.createElement('div');
    wrapperElement.style.position = 'relative';
    wrapperElement.appendChild(element);
    element.style.position = 'absolute';
    element.style.width = '100%';
    element.style.height = '100%';

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
        drawTicks: false,
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

  setOnPriceSelect(onPriceSelect: null | ((price: number) => void)) {
    if (this.priceSelectHandler != null) {
      this.chart.unsubscribeClick(this.priceSelectHandler);
      this.priceSelectHandler = null;
    }
    if (onPriceSelect) {
      const newHandler = (param: any) => {
        const price = this.ohlc?.coordinateToPrice(param.point.y);
        onPriceSelect(parseFloat(`${price}`));
      };
      this.chart.subscribeClick(newHandler);
      this.priceSelectHandler = newHandler;
    }
  }

  setOhlc(data: TChartCandle[], fitTime: boolean = false) {
    if (!this.ohlc) {
      this.ohlc = this.chart.addCandlestickSeries({
        upColor: this.colorConfig.buy,
        downColor: this.colorConfig.sell,
        borderDownColor: this.colorConfig.sell,
        borderUpColor: this.colorConfig.buy,
        wickDownColor: this.colorConfig.sell,
        wickUpColor: this.colorConfig.buy,
      });
    }
    this.setOhlcData(data);
    // temp
    if (fitTime) this.chart.timeScale().fitContent();
  }

  setPosition(positionLine: TChartLine | null) {
    if (this.position) this.ohlc?.removePriceLine(this.position);
    if (positionLine != null) {
      this.position = this.setPriceLine(positionLine);
    }
  }

  setLiquidation(liqLine: TChartLine | null) {
    if (this.liquidation) this.ohlc?.removePriceLine(this.liquidation);
    if (liqLine != null) {
      this.liquidation = this.setPriceLine(liqLine);
    }
  }

  setOpenOrders(orders: Map<string, TChartLine>) {
    if (!this.ohlc) {
      throw new Error('Need to set OHLC first to set open orders');
    }
    const updOrders = new Map();
    const oldOrders = this.openOrders;
    orders.forEach((oLine, id) => {
      if (!this.ohlc) return;
      const existingOrder = oldOrders.get(id);
      if (existingOrder) {
        this.removePriceLine(existingOrder);
        oldOrders.delete(id);
      }
      const pl = this.setPriceLine(oLine);
      updOrders.set(id, pl);
    });
    oldOrders.forEach(v => this?.removePriceLine(v));
    this.openOrders = updOrders;
  }

  // TODO: allow to update individual orders...
  // updOpenOrders(ordersDiff: Map<string, TChartLine>) {
  //   console.log('upd orders', ordersDiff);
  // }

  setPendingOrders(pendingOrders: TChartLine[]) {
    this.pendingOrders.forEach(po => {
      this.removePriceLine(po);
    });
    this.pendingOrders = [];
    pendingOrders.forEach(po => {
      if (po.price != null) {
        const pl = this.setPriceLine(po);
        this.pendingOrders.push(pl);
      }
    });
  }

  private setOhlcData(candlesData: TChartCandle[]) {
    if (!this.ohlc) {
      throw new Error('Need to set OHLC first to set data');
    }
    const data = candlesData.map(this.convertOhlcData);
    this.ohlc.setData(data);
  }

  private convertOhlcData({ t, o, c, l, h }: TChartCandle): LWC.BarData {
    return {
      // @ts-ignore
      time: t,
      open: o,
      close: c,
      low: l,
      high: h,
    };
  }

  private setPriceLine(options: TChartLine): LWC.IPriceLine {
    if (!this.ohlc) {
      throw new Error('Need to set OHLC first for the price line');
    }
    return this.ohlc.createPriceLine({
      color: '#fff',
      // @ts-ignore
      lineWidth: 1,
      lineStyle: LWC.LineStyle.Solid,
      axisLabelVisible: true,
      ...options,
    });
  }

  private removePriceLine(priceLine: LWC.IPriceLine) {
    if (!this.ohlc) return;
    this.ohlc.removePriceLine(priceLine);
  }
}
