import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { init, tview } from '../dist';
import { OHLC } from './data';

const App = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div>
        <Chart />
        <Chart2 />
      </div>
    </div>
  );
};

const WIDTH = 640;
const HEIGHT = 480;

const Chart = () => {
  const canvasRef = React.useRef<any>();

  React.useEffect(() => {
    if (!canvasRef.current) return;
    init(canvasRef.current, OHLC);
  }, [canvasRef.current]);

  return (
    <canvas
      ref={canvasRef}
      id="webgl-canvas"
      width="640"
      height="480"
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
    tview.createChart(chartRef.current, OHLC);
  }, [chartRef.current]);

  return (
    <div
      ref={chartRef}
      style={{
        borderRadius: '10px',
        background: '#444444',
        width: WIDTH,
        height: HEIGHT,
      }}
    />
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
