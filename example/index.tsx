import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { init, tview } from '../dist';
import { OHLC, OHLC2 } from './data';

const { Chart } = tview;

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
    init(canvasRef.current, OHLC);
  }, [canvasRef.current]);

  return (
    <canvas
      ref={canvasRef}
      id="webgl-canvas"
      width={WIDTH}
      height={HEIGHT}
      style={{ borderRadius: '10px', marginBottom: '10px' }}
    >
      no canvas
    </canvas>
  );
};

const Chart2 = () => {
  const chartRef = React.useRef<any>();

  React.useEffect(() => {
    if (!chartRef.current) return;
    const chart = new Chart(chartRef.current);
    const ohlcSeries = chart.addCandlestickSeries();
    ohlcSeries.setData(OHLC2);
  }, [chartRef.current]);

  return (
    <div
      ref={chartRef}
      style={{
        borderRadius: '10px',
        width: WIDTH,
        height: HEIGHT,
      }}
    />
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
