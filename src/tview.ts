import * as LWC from 'lightweight-charts';

import {
  TChartCandle,
  TColorConfig,
  TChartOrder,
  TChartPosition,
  COLOR_DEFAULT,
} from './types';

export class ChartOld {
  width: number;
  height: number;
  chart: LWC.IChartApi;
  colorConfig: TColorConfig;
  //
  ohlc: LWC.ISeriesApi<'Candlestick'> | null = null;
  position: { c: LWC.IPriceLine; d: TChartPosition } | null = null;
  liquidation: { c: LWC.IPriceLine; d: number } | null = null;
  orders: Map<string, { c: LWC.IPriceLine; d: TChartOrder }> = new Map();
  //
  priceSelectHandler: null | LWC.MouseEventHandler = null;
  ordersTitleViz: boolean = false;

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

  setOhlc(data: TChartCandle[]) {
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
  }

  setPosition(position: TChartPosition | null) {
    if (this.position) this.ohlc?.removePriceLine(this.position.c);
    if (position != null) {
      const c = this.setPriceLine(position.price, this.colorConfig.position, {
        title: `${position.size}`,
      });
      if (c) this.position = { c, d: position };
    }
  }

  setLiquidation(price: number | null) {
    if (this.liquidation) this.ohlc?.removePriceLine(this.liquidation.c);
    if (price != null) {
      const c = this.setPriceLine(price, this.colorConfig.liquidation, {
        title: 'liquidation',
      });
      if (c) this.liquidation = { c, d: price };
    }
  }

  setOrders(orders: TChartOrder[], isPending: boolean = false) {
    if (!this.ohlc) return;
    const updOrders = new Map();
    orders.forEach(o => {
      if (!this.ohlc) return;
      const existingOrder = this.orders.get(o.id);
      if (existingOrder) {
        this.removePriceLine(existingOrder.c);
        this.orders.delete(o.id);
      }
      const color = o.size > 0 ? this.colorConfig.buy : this.colorConfig.sell;
      const pl = this.setPriceLine(
        o.price,
        isPending ? this.colorConfig.orderPending : color,
        { title: this.ordersTitleViz ? `${o.size}` : '' }
      );
      updOrders.set(o.id, { c: pl, d: o });
    });
    this.orders.forEach(v => this?.removePriceLine(v.c));
    this.orders = updOrders;
  }

  setPendingOrders(pendingOrders: TChartOrder[]) {
    this.setOrders(pendingOrders, true);
  }

  setOrdersTitleViz(isViz: boolean) {
    if (this.ordersTitleViz === isViz) return;
    this.ordersTitleViz = isViz;

    Array.from(this.orders).forEach(([_, o]) => {
      this.removePriceLine(o.c);
      let pl = this.setPriceLine(
        o.d.price,
        o.d.size > 0 ? this.colorConfig.buy : this.colorConfig.sell,
        { title: isViz ? `${o.d.size}` : '' }
      );
      if (!pl) return;
      this.orders.set(o.d.id, { c: pl, d: o.d });
    });
  }

  private setOhlcData(candlesData: TChartCandle[]) {
    if (!this.ohlc) return;
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

  private setPriceLine(
    price: number,
    color: string,
    options: { title?: string } = {}
  ) {
    if (!this.ohlc) return;
    // @ts-ignore
    return this.ohlc.createPriceLine({
      price,
      color: color,
      lineWidth: 2,
      lineStyle: LWC.LineStyle.Dashed,
      axisLabelVisible: true,
      ...options,
    });
  }

  private removePriceLine(priceLine: LWC.IPriceLine) {
    if (!this.ohlc) return;
    this.ohlc.removePriceLine(priceLine);
  }
}
