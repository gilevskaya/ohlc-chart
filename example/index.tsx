import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ChartOld, create, TChartCandle } from '../dist';
import { OHLC, OHLC2 } from './data';

import * as LWC from 'lightweight-charts';

const App = () => {
  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <div style={{ flex: 1 }}>
          <Chart2 ohlc={OHLC2} />
        </div>
        <div style={{ flex: 1 }}></div>
      </div>
    </div>
  );
};

const WIDTH = 640;
const HEIGHT = 480;

// const Chart1 = () => {
//   const canvasRef = React.useRef<any>();

//   React.useEffect(() => {
//     if (!canvasRef.current) return;
//     new Chart(canvasRef.current, OHLC);
//   }, [canvasRef.current]);

//   return (
//     <canvas
//       ref={canvasRef}
//       id="webgl-canvas"
//       width={WIDTH}
//       height={HEIGHT}
//       style={{ marginBottom: '20px' }}
//     >
//       no canvas
//     </canvas>
//   );
// };

// const Chart2 = () => {
//   const chartContainerRef = React.useRef<HTMLDivElement | null>(null);
//   const chartRef = React.useRef<ChartOld>();
//   const ohlcSeriesRef = React.useRef<OhlcSeries>();

//   const indexRef = React.useRef<number>(Math.round(OHLC2.length / 2));

//   React.useEffect(() => {
//     const interval = setInterval(() => {
//       if (!ohlcSeriesRef.current) return;
//       if (indexRef.current >= OHLC2.length) {
//         clearInterval(interval);
//         return;
//       }
//       ohlcSeriesRef.current.addLastCandle(OHLC2[indexRef.current]);
//       indexRef.current++;
//     }, 2000);
//     return () => clearInterval(interval);
//   }, []);

//   React.useEffect(() => {
//     if (!chartContainerRef.current) return;
//     chartRef.current = new ChartOld(chartContainerRef.current);
//     ohlcSeriesRef.current = chartRef.current.addOhlcSeries();
//     ohlcSeriesRef.current.setData(OHLC2.slice(0, indexRef.current));

//     ohlcSeriesRef.current.setPosition(13665);
//     ohlcSeriesRef.current.setOrders([
//       {
//         id: '200-13650',
//         size: 200,
//         price: 13650,
//       },
//       {
//         id: '200-13643',
//         size: 200,
//         price: 13643,
//       },
//       {
//         id: '200-13675',
//         size: -400,
//         price: 13705,
//       },
//     ]);
//   }, [chartContainerRef.current]);

//   return (
//     <div
//       ref={chartContainerRef}
//       style={{
//         width: WIDTH,
//         height: HEIGHT,
//       }}
//     />
//   );
// };

const Chart2 = ({ ohlc }: { ohlc: TChartCandle[] }) => {
  const chartContainerRef = React.useRef<HTMLDivElement | null>(null);
  const chartRef = React.useRef<ChartOld | null>(null);

  // const indexRef = React.useRef<number>(Math.round(OHLC2.length / 2));

  // React.useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (!ohlcSeriesRef.current) return;
  //     if (indexRef.current >= OHLC2.length) {
  //       clearInterval(interval);
  //       return;
  //     }
  //     ohlcSeriesRef.current.addLastCandle(OHLC2[indexRef.current]);
  //     indexRef.current++;
  //   }, 2000);
  //   return () => clearInterval(interval);
  // }, []);

  React.useEffect(() => {
    if (!chartContainerRef.current) return;
    chartRef.current = new ChartOld(chartContainerRef.current);
    chartRef.current.setCandles(ohlc);
    chartRef.current.setPosition(13665);
    chartRef.current.setOrders([
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
    //   chartRef.current = create(chartContainerRef.current);
    //   console.log(chartRef.current);
    //   chartRef.current.addOhlc();
    //   chartRef.current.setOhlcData(OHLC2.slice(0, indexRef.current));

    //   // ohlcSeriesRef.current.setPosition(13665);
    //   // ohlcSeriesRef.current.setOrders([
    //   //   {
    //   //     id: '200-13650',
    //   //     size: 200,
    //   //     price: 13650,
    //   //   },
    //   //   {
    //   //     id: '200-13643',
    //   //     size: 200,
    //   //     price: 13643,
    //   //   },
    //   //   {
    //   //     id: '200-13675',
    //   //     size: -400,
    //   //     price: 13705,
    //   //   },
    //   // ]);
  }, [chartContainerRef.current]);

  return (
    <div
      ref={chartContainerRef}
      style={{
        width: '100%',
        height: '100%',
        border: '1px dashed salmon',
      }}
    />
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
