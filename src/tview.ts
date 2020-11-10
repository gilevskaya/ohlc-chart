// @ts-ignore
import * as LWC from 'lightweight-charts';

import { TCandle } from './';

export function createChart(
  canvasWrapDiv: HTMLDivElement,
  candlesData: TCandle[]
) {
  const { clientWidth: width, clientHeight: height } = canvasWrapDiv;
  const chart = LWC.createChart(canvasWrapDiv, {
    width,
    height,
    crosshair: {
      mode: LWC.CrosshairMode.Normal,
    },
    layout: {
      backgroundColor: '#1a202c',
      textColor: '#edf2f7',
    },
    grid: {
      vertLines: {
        color: '#2d3748',
      },
      horzLines: {
        color: '#2d3748',
      },
    },
    timeScale: {
      // rightOffset: 12,
      // barSpacing: 3,
      // fixLeftEdge: true,
      rightBarStaysOnScroll: true,
      // borderVisible: false,
      // borderColor: "#fff000",
      visible: true,
      timeVisible: true,
      secondsVisible: true,
    },
  });

  const candleSeries = chart.addCandlestickSeries({
    upColor: 'green',
    downColor: 'red',
    borderDownColor: 'red',
    borderUpColor: 'green',
    wickDownColor: 'red',
    wickUpColor: 'green',
  });

  // @ts-ignore
  const data: LWC.BarData = candlesData.map(
    ({ timestamp, open, close, low, high }) => ({
      time: timestamp,
      open,
      close,
      low,
      high,
    })
  );
  // @ts-ignore
  candleSeries.setData(data);

  console.log('*', candleSeries);
}
