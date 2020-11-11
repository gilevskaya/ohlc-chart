import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Chart, ChartOld, OHLCSeries } from '../dist';
import { OHLC, OHLC2 } from './data';

const App = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div>
        <Chart1 />
        <Chart2 />
      </div>
    </div>
  );
};

const WIDTH = 640;
const HEIGHT = 480;

const Chart1 = () => {
  const canvasRef = React.useRef<any>();

  React.useEffect(() => {
    if (!canvasRef.current) return;
    new Chart(canvasRef.current, OHLC);
  }, [canvasRef.current]);

  return (
    <canvas
      ref={canvasRef}
      id="webgl-canvas"
      width={WIDTH}
      height={HEIGHT}
      style={{ marginBottom: '20px' }}
    >
      no canvas
    </canvas>
  );
};

const Chart2 = () => {
  const chartContainerRef = React.useRef<HTMLDivElement | null>(null);
  const chartRef = React.useRef<ChartOld>();
  const ohlcSeriesRef = React.useRef<OHLCSeries>();

  const indexRef = React.useRef<number>(Math.round(OHLC2.length / 2));

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!ohlcSeriesRef.current) return;
      if (indexRef.current >= OHLC2.length) {
        clearInterval(interval);
        return;
      }
      ohlcSeriesRef.current.addLastCandle(OHLC2[indexRef.current]);
      indexRef.current++;
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (!chartContainerRef.current) return;
    chartRef.current = new ChartOld(chartContainerRef.current);
    ohlcSeriesRef.current = chartRef.current.addOHLCSeries();
    ohlcSeriesRef.current.setData(OHLC2.slice(0, indexRef.current));

    ohlcSeriesRef.current.setPosition(13665);
    ohlcSeriesRef.current.setOrders([
      {
        id: '200-13650',
        size: 200,
        price: 13650,
      },
      {
        id: '200-13643',
        size: 200,
        price: 13643,
      },
      {
        id: '200-13675',
        size: -400,
        price: 13705,
      },
    ]);
  }, [chartContainerRef.current]);

  return (
    <div
      ref={chartContainerRef}
      style={{
        width: WIDTH,
        height: HEIGHT,
      }}
    />
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
