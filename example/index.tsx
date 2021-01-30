import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  createChart,
  TChartCandle,
  TChartOrder,
  TChartPosition,
} from '../dist';
import { ChartOld } from '../dist/tview';
import { OHLC2 } from './data';

import './index.css';

const Input = ({
  label,
  value,
  setValue,
  chartSelect,
}: {
  label?: string;
  value: string;
  setValue: (string) => void;
  chartSelect?: {
    isOn: boolean;
    onClick: () => void;
  };
}) => {
  return (
    <div className="pb-2">
      {label && <label className="text-xs text-gray-400 mb-1">{label}</label>}
      <div className="flex">
        <input
          className="border border-gray-500 bg-gray-600 w-full p-1 px-2 text-sm text-right focus:outline-none"
          type="number"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        {chartSelect && (
          <button
            className={`w-8 border-r border-t border-b border-gray-500 bg-gray-600 focus:outline-none text-center text-gray-500 font-semibold ${
              chartSelect.isOn ? 'bg-gray-800' : ''
            }`}
            onClick={chartSelect.onClick}
          >
            c
          </button>
        )}
      </div>
    </div>
  );
};

const App = () => {
  const [price1, setPrice1] = React.useState<number | null>(null);
  const [price2, setPrice2] = React.useState<number | null>(null);
  const [position, setPosition] = React.useState<TChartPosition | null>({
    price: 13660,
    size: 10000,
  });
  const [liq, setLiq] = React.useState<number | null>(13610);
  const [orders, setOrders] = React.useState<TChartOrder[]>([
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
  const [select, setSelect] = React.useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = React.useState<number | null>(null);

  const priceNumToStr = num => (num == null ? '' : num.toFixed(1));
  const priceStrToNum = str => (str === '' ? null : parseFloat(str));

  // React.useEffect(() => {
  //   console.log('select', select);
  // }, [select]);

  React.useEffect(() => {
    if (!selectedPrice) return;
    const p = parseFloat(selectedPrice.toFixed(1));
    if (select === 'position') {
      setPosition(oldP => (oldP ? { ...oldP, price: p } : null));
    } else if (select === 'liq') {
      setLiq(p);
    } else if (select === 'price1') {
      setPrice1(p);
    } else if (select === 'price2') {
      setPrice2(p);
    }
  }, [selectedPrice]);

  return (
    <div className="h-screen w-full bg-gray-900 text-gray-200 flex">
      <div className="p-3 h-full" style={{ width: '230px' }}>
        <Input
          label="price 1"
          value={priceNumToStr(price1)}
          setValue={v => setPrice1(priceStrToNum(v))}
          chartSelect={{
            isOn: select === 'price1',
            onClick: () => setSelect(s => (s !== 'price1' ? 'price1' : null)),
          }}
        />
        <Input
          label="price 2"
          value={priceNumToStr(price2)}
          setValue={v => setPrice2(priceStrToNum(v))}
          chartSelect={{
            isOn: select === 'price2',
            onClick: () => setSelect(s => (s !== 'price2' ? 'price2' : null)),
          }}
        />
        <Input
          label="position"
          value={priceNumToStr(position?.price)}
          setValue={v => {
            const p = priceStrToNum(v);
            setPosition(oldP => (oldP && p ? { ...oldP, price: p } : null));
          }}
          chartSelect={{
            isOn: select === 'position',
            onClick: () =>
              setSelect(s => (s !== 'position' ? 'position' : null)),
          }}
        />
        <Input
          label="liquidation"
          value={priceNumToStr(liq)}
          setValue={v => setLiq(priceStrToNum(v))}
          chartSelect={{
            isOn: select === 'liq',
            onClick: () => setSelect(s => (s !== 'liq' ? 'liq' : null)),
          }}
        />
        <div className="pt-4">
          <label className="text-xs text-gray-400 mb-1">orders</label>
          {orders.map((o, i) => (
            <div className="flex" key={o.id}>
              <div className="mr-1">
                <Input
                  value={`${o.size}`}
                  setValue={v => {
                    let s = parseInt(v);
                    setOrders((os: TChartOrder[]) => {
                      let newOrders = [...os];
                      if (s) {
                        newOrders[i] = { ...newOrders[i], size: s };
                      }
                      return newOrders;
                    });
                  }}
                />
              </div>
              <Input
                value={priceNumToStr(o.price)}
                setValue={v => {
                  let p = priceStrToNum(v);
                  setOrders((os: TChartOrder[]) => {
                    let newOrders = [...os];
                    if (p != null) {
                      newOrders[i] = { ...newOrders[i], price: p };
                    }
                    return newOrders;
                  });
                }}
                chartSelect={{
                  isOn: select === 'position',
                  onClick: () =>
                    setSelect(s => (s !== 'position' ? 'position' : null)),
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="h-full flex-1 flex flex-col">
        <div>chart tabs...</div>
        <div className="flex-1">
          <Chart2
            ohlc={OHLC2}
            onChartSelect={setSelectedPrice}
            position={position}
            liq={liq}
            orders={orders}
            pendingOrder={{ price1, price2 }}
          />
        </div>
      </div>
    </div>
  );
};

const Chart2 = React.memo(
  ({
    ohlc,
    onChartSelect,
    position,
    liq,
    orders,
    pendingOrder,
  }: {
    ohlc: TChartCandle[];
    onChartSelect: (number) => void;
    position: TChartPosition | null;
    liq: number | null;
    orders: TChartOrder[];
    pendingOrder: { price1: number | null; price2: number | null };
  }) => {
    const chartContainerRef = React.useRef<HTMLDivElement | null>(null);
    const chartRef = React.useRef<ChartOld | null>(null);
    const [loaded, setLoaded] = React.useState(false);

    const [pendingOrders, setPendingOrders] = React.useState([]);

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
      if (loaded) return;
      chartRef.current = createChart(chartContainerRef.current);
      chartRef.current.setOhlc(ohlc);
      chartRef.current.setOnPriceSelect(onChartSelect);
      setLoaded(true);
    }, [chartContainerRef.current, loaded]);

    React.useEffect(() => {
      console.log('pendingOrder', pendingOrder);
      if (!loaded) return;
      chartRef.current?.setPendingOrders([
        {
          id: `123`,
          size: 10,
          price: 13670,
        },
      ]);
    }, [loaded, pendingOrder]);

    React.useEffect(() => {
      if (!loaded) return;
      chartRef.current?.setPosition(position);
    }, [loaded, position]);

    React.useEffect(() => {
      if (!loaded) return;
      chartRef.current?.setLiquidation(liq);
    }, [loaded, liq]);

    React.useEffect(() => {
      if (!loaded) return;
      chartRef.current?.setOrders(orders);
    }, [loaded, orders]);

    return React.useMemo(() => {
      return (
        <div
          ref={chartContainerRef}
          className="w-full h-full border border-lg"
        />
      );
    }, []);
  }
);

ReactDOM.render(<App />, document.getElementById('root'));

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
