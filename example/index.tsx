import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  createChart,
  TChartCandle,
  TChartLine,
  LineStyle,
  ChartOld,
} from '../dist';
import { OHLC2 } from './data';

import './index.css';

type TPosition = {
  price: number;
  size: number;
  liq: number;
};

type TOrder = {
  id: string;
  size: number;
  price: number;
};

type TPendingOrder = {
  price: number;
  size?: number | null;
  isValid?: boolean;
};

let MOCK = {
  size: 10000,
  position: {
    price: 13660.45,
    size: 10000,
    liq: 13610,
  },
  orders: [
    {
      id: '200-13650',
      size: 2000,
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
  ],
};

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

const numToStr = (
  num: null | undefined | number,
  opt: { maxFrDigits?: number; useGrouping?: boolean } = {}
): string => {
  if (num == null) return '';
  const a = num
    .toLocaleString('fr-FR', {
      useGrouping: opt.useGrouping ?? false,
      maximumFractionDigits: opt.maxFrDigits ?? 4,
    })
    .replace(/,/i, '.');
  return a;
};

const App = () => {
  const [position, setPosition] = React.useState<TPosition | null>(
    MOCK.position
  );
  const [openOrders, setOpenOrders] = React.useState(
    new Map(MOCK.orders.map(o => [o.id, o]))
  );
  const [size, setSize] = React.useState<number | null>(MOCK.size);
  const [sprayCount, setsSprayCount] = React.useState<number | null>(null);
  const [price1, setPrice1] = React.useState<number | null>(null);
  const [price2, setPrice2] = React.useState<number | null>(null);

  const [select, setSelect] = React.useState<string | null>(null);
  const [selectedPrice, setSelectedPrice] = React.useState<number | null>(null);

  const roundTo05 = num => Math.round(num * 2) / 2;
  const priceStrToNum = str => {
    if (str === '') return null;
    const fl = parseFloat(str);
    return fl;
  };

  React.useEffect(() => {
    if (!selectedPrice) return;
    const p = parseFloat(selectedPrice.toFixed(1));
    if (select === 'position') {
      setPosition(oldP => (oldP ? { ...oldP, price: p } : null));
    } else if (select === 'liq') {
      setPosition(oldP => (oldP ? { ...oldP, liq: p } : null));
    } else if (select === 'price1') {
      setPrice1(p);
    } else if (select === 'price2') {
      setPrice2(p);
    }
  }, [selectedPrice]);

  const pendingOrders: Array<TPendingOrder> = React.useMemo(() => {
    const isSizePosN = size != null && size > 0;
    if (price1 != null && price1 > 0 && price2 != null && price2 > 0) {
      if (sprayCount != null && sprayCount > 1) {
        let sprayOrders: Array<TPendingOrder> = [];
        let currPrice = Math.min(price1, price2);
        let maxPrice = Math.max(price1, price2);
        const stepPrice = (maxPrice - currPrice) / (sprayCount - 1);
        for (let i = 0; i < sprayCount; i++) {
          if (i === sprayCount - 1)
            sprayOrders.push({
              price: maxPrice,
              size,
              isValid: isSizePosN,
            });
          else
            sprayOrders.push({
              price: currPrice,
              size,
              isValid: isSizePosN,
            });
          currPrice += stepPrice;
        }
        return sprayOrders;
      } else {
        return [
          {
            price: price1,
            size,
            isValid: false,
          },
          {
            price: price2,
            size,
            isValid: false,
          },
        ];
      }
    }
    if (price1 != null && price1 > 0) {
      return [{ price: price1, size, isValid: isSizePosN }];
    }
    if (price2 != null && price2 > 0) {
      return [{ price: price2, size, isValid: false }];
    }
    return [];
  }, [price1, price2, size, sprayCount]);

  return (
    <div className="h-screen w-full bg-gray-900 text-gray-200 flex">
      <div className="p-3 h-full" style={{ width: '230px' }}>
        <div className="flex">
          <div className="flex-1 mr-1">
            <Input
              label="size"
              value={numToStr(size, { maxFrDigits: 0 })}
              setValue={v => setSize(priceStrToNum(v))}
            />
          </div>
          <div className="flex-1 ml-1">
            <Input
              label="spray count"
              value={numToStr(sprayCount, { maxFrDigits: 0 })}
              setValue={v => setsSprayCount(priceStrToNum(v))}
            />
          </div>
        </div>
        <Input
          label="price 1"
          value={numToStr(price1, { maxFrDigits: 1, useGrouping: false })}
          setValue={v => setPrice1(priceStrToNum(v))}
          chartSelect={{
            isOn: select === 'price1',
            onClick: () => setSelect(s => (s !== 'price1' ? 'price1' : null)),
          }}
        />
        <Input
          label="price 2"
          value={numToStr(price2)}
          setValue={v => setPrice2(priceStrToNum(v))}
          chartSelect={{
            isOn: select === 'price2',
            onClick: () => setSelect(s => (s !== 'price2' ? 'price2' : null)),
          }}
        />
        <Input
          label="position"
          value={numToStr(position?.price)}
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
          value={numToStr(position?.liq)}
          setValue={v => {
            const p = priceStrToNum(v);
            setPosition(oldP => (oldP && p ? { ...oldP, liq: p } : null));
          }}
          chartSelect={{
            isOn: select === 'liq',
            onClick: () => setSelect(s => (s !== 'liq' ? 'liq' : null)),
          }}
        />
        <div className="pt-4">
          <label className="text-xs text-gray-400 mb-1">orders</label>
          {Array.from(openOrders).map(([id, o]) => (
            <div className="flex" key={id}>
              <div className="mr-1">
                <Input
                  value={`${o.size}`}
                  setValue={v => {
                    let s = parseInt(v);
                    setOpenOrders(os => {
                      if (!s) return os;
                      let newOrders = new Map(os);
                      newOrders.set(id, { ...o, size: s });
                      return newOrders;
                    });
                  }}
                />
              </div>
              <Input
                value={numToStr(o.price)}
                setValue={v => {
                  let p = priceStrToNum(v);
                  setOpenOrders(os => {
                    if (!p) return os;
                    let newOrders = new Map(os);
                    newOrders.set(id, { ...o, price: p });
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
            onChartSelect={p => setSelectedPrice(roundTo05(p))}
            position={position}
            openOrders={openOrders}
            pendingOrders={pendingOrders}
          />
        </div>
      </div>
    </div>
  );
};

const COLOR = {
  pendingOrder: '#c8c8c8',
  pendingOrderInvalid: '#989898',
  orderBuy: '#22833D',
  orderSell: '#B82E40',
  position: '#0666b7',
  liquidation: '#b82e40',
};
// buy: "#22833D",
// "buy-dark": "#044516",
// sell: "#B82E40",
// "sell-dark": "#48141C",
// accent: "#0666b7",

const Chart2 = React.memo(
  ({
    ohlc,
    onChartSelect,
    position,
    openOrders,
    pendingOrders,
  }: {
    ohlc: TChartCandle[];
    onChartSelect: (number) => void;
    position: TPosition | null;
    openOrders: Map<string, TOrder>;
    pendingOrders: Array<TPendingOrder>;
  }) => {
    const chartContainerRef = React.useRef<HTMLDivElement | null>(null);
    const chartRef = React.useRef<ChartOld | null>(null);
    const [loaded, setLoaded] = React.useState(false);

    const indexRef = React.useRef<number>(Math.round(ohlc.length - 10));

    React.useEffect(() => {
      if (!loaded || !chartRef.current) return;
      const interval = setInterval(() => {
        if (indexRef.current >= ohlc.length) {
          clearInterval(interval);
          return;
        }
        chartRef.current?.updCandle(ohlc[indexRef.current]);
        indexRef.current++;
      }, 2000);
      return () => clearInterval(interval);
    }, [chartContainerRef.current, loaded]);

    React.useEffect(() => {
      if (!chartContainerRef.current || loaded) return;
      chartRef.current = createChart(chartContainerRef.current);
      chartRef.current.setCandles(ohlc.slice(0, indexRef.current), true);
      chartRef.current.setOnPriceSelect(onChartSelect);
      setLoaded(true);
    }, [chartContainerRef.current, loaded]);

    React.useEffect(() => {
      if (!loaded || !chartRef.current) return;
      let chartPos = (pos: TPosition): TChartLine => ({
        price: pos.price,
        title: numToStr(pos.size, { useGrouping: true }),
        color: COLOR.position,
      });
      let chartLiq = (pos: TPosition): TChartLine => ({
        price: pos.liq,
        title: 'liquidation',
        color: COLOR.liquidation,
        lineWidth: 2,
      });
      chartRef.current.setPosition(position ? chartPos(position) : null);
      chartRef.current?.setLiquidation(position ? chartLiq(position) : null);
    }, [loaded, position]);

    React.useEffect(() => {
      if (!loaded || !chartRef.current) return;
      const chartOrder = (order: TOrder): TChartLine => ({
        price: order.price,
        title: numToStr(order.size, { useGrouping: true }),
        color: order.size > 0 ? COLOR.orderBuy : COLOR.orderSell,
        lineStyle: LineStyle.Dashed,
        lineWidth: 2,
      });
      chartRef.current.setOpenOrders(
        new Map(Array.from(openOrders).map(([id, o]) => [id, chartOrder(o)]))
      );
    }, [loaded, openOrders]);

    React.useEffect(() => {
      if (!loaded) return;
      chartRef.current?.setPendingOrders(
        pendingOrders.map(po => ({
          price: po.price,
          title: numToStr(po.size, { useGrouping: true }),
          color: po.isValid ? COLOR.pendingOrder : COLOR.pendingOrderInvalid,
          lineStyle: LineStyle.Dashed,
          lineWidth: 2,
        }))
      );
    }, [loaded, pendingOrders]);

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
