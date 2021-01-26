import * as THREE from 'three';

import { TChartCandle, COLOR_DEFAULT, TColorConfig } from './types';
import { ChartOld } from './tview';

type TCandleParts = {
  body: { buy: THREE.Mesh; sell: THREE.Mesh };
  bodyFlat: { buy: THREE.Line; sell: THREE.Line };
  wick: { buy: THREE.Line; sell: THREE.Line };
};

type TScale = {
  price: { min: number; max: number; step: number };
  time: { min: number; max: number; step: number; count: number };
};

export class Chart {
  widht: number;
  height: number;
  camera: THREE.Camera;
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;

  constructor(canvas: HTMLCanvasElement, candlesData: TChartCandle[]) {
    const { height, width } = canvas;
    [this.widht, this.height] = [width, height];

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(COLOR_DEFAULT.bg, 1.0);

    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000);
    this.camera.position.z = 1;

    this.scene = new THREE.Scene();
    const sceneScale: [number, number, number] = [0.9, 0.9, 1];

    const scale = this.getOhlcRangeStep(candlesData);

    const grid = this.makeGrid(scale);
    grid.scale.set(...sceneScale);
    grid.position.setZ(-1);
    this.scene.add(grid);

    const candleParts = this.getCandleParts();
    const candlesGroup = new THREE.Group();
    const candles: THREE.Group[] = [];
    candlesData.forEach((cd: TChartCandle) => {
      candles.push(this.makeCandle(candleParts, cd, scale));
    });
    candles.forEach(c => candlesGroup.add(c));
    candlesGroup.scale.set(...sceneScale);
    this.scene.add(candlesGroup);

    this.render();
  }

  private getCandleParts(): TCandleParts {
    const material = {
      mesh: {
        buy: new THREE.MeshBasicMaterial({ color: COLOR_DEFAULT.buy }),
        sell: new THREE.MeshBasicMaterial({ color: COLOR_DEFAULT.sell }),
      },
      line: {
        buy: new THREE.LineBasicMaterial({
          color: COLOR_DEFAULT.buy,
          linewidth: 2,
        }),
        sell: new THREE.LineBasicMaterial({
          color: COLOR_DEFAULT.sell,
          linewidth: 2,
        }),
      },
    };

    const makeCandleBody = (() => {
      const shape = new THREE.Shape();
      shape.currentPoint = new THREE.Vector2(0, 0);
      shape.setFromPoints([
        new THREE.Vector2(c(0), c(0)),
        new THREE.Vector2(c(0), c(1)),
        new THREE.Vector2(c(1), c(1)),
        new THREE.Vector2(c(1), c(0)),
      ]);
      const geometry = new THREE.ShapeBufferGeometry(shape);
      return (material: THREE.MeshBasicMaterial) =>
        new THREE.Mesh(geometry, material);
    })();

    const makeCandleBodyFlat = (() => {
      const path = new THREE.Path();
      path.setFromPoints([new THREE.Vector2(-1, 0), new THREE.Vector2(1, 0)]);
      const geometry = new THREE.BufferGeometry().setFromPoints(
        path.getPoints()
      );
      return (material: THREE.LineBasicMaterial) =>
        new THREE.Line(geometry, material);
    })();

    const makeCandleWick = (() => {
      const path = new THREE.Path();
      path.setFromPoints([new THREE.Vector2(0, -1), new THREE.Vector2(0, 1)]);
      const geometry = new THREE.BufferGeometry().setFromPoints(
        path.getPoints()
      );
      return (material: THREE.LineBasicMaterial) =>
        new THREE.Line(geometry, material);
    })();

    return {
      body: {
        buy: makeCandleBody(material.mesh.buy),
        sell: makeCandleBody(material.mesh.sell),
      },
      bodyFlat: {
        buy: makeCandleBodyFlat(material.line.buy),
        sell: makeCandleBodyFlat(material.line.sell),
      },
      wick: {
        buy: makeCandleWick(material.line.buy),
        sell: makeCandleWick(material.line.sell),
      },
    };
  }

  private makeCandle(
    candleParts: TCandleParts,
    candleData: TChartCandle,
    { price, time }: TScale
  ): THREE.Group {
    const { body, bodyFlat, wick } = candleParts;
    const { t: timestamp, o: open, h: high, l: low, c: close } = candleData;
    const candleBody = (open > close ? body.sell : body.buy).clone();
    const candleBodyFlat = (open > close
      ? bodyFlat.sell
      : bodyFlat.buy
    ).clone();
    const candleWick = (open > close ? wick.sell : wick.buy).clone();
    const candleGroup = new THREE.Group();

    const bodyH = Math.abs(open - close) / (price.max - price.min);
    const wickH = Math.abs(low - high) / (price.max - price.min);

    if (typeof timestamp !== 'number') throw new Error('Boo!');
    const deltaX = (timestamp - time.step) / (time.max - time.min);
    const iY = 1 / (price.max - price.min);
    const bodyDeltaY =
      (Math.abs(open - close) / 2 + (Math.min(open, close) - price.min)) * iY;
    const wickDeltaY =
      (Math.abs(low - high) / 2 + (Math.min(low, high) - price.min)) * iY;

    if (bodyH > 0) {
      candleBody.scale.set(1, bodyH, 1);
      candleBody.translateY(c(bodyDeltaY));
      candleGroup.add(candleBody);
    } else {
      candleBodyFlat.translateY(c(bodyDeltaY));
      candleGroup.add(candleBodyFlat);
    }

    candleWick.scale.set(1, wickH, 1);
    candleWick.translateY(c(wickDeltaY));

    candleGroup.add(candleWick);
    candleGroup.scale.set(0.85 / time.count, 1, 1);
    candleGroup.position.set(c(deltaX), 0, 0);
    return candleGroup;
  }

  private makeGrid({ time, price }: TScale) {
    const stepX = time.step / (time.max - time.min);
    const stepY = price.step / (price.max - price.min);

    const gridLineMaterial = new THREE.LineBasicMaterial({
      color: COLOR_DEFAULT.grid,
      linewidth: 0.5,
    });

    function makeBaseLine(x1: number, y1: number, x2: number, y2: number) {
      const path = new THREE.Path();
      path.setFromPoints([
        new THREE.Vector2(x1, y1),
        new THREE.Vector2(x2, y2),
      ]);
      const geometry = new THREE.BufferGeometry().setFromPoints(
        path.getPoints()
      );
      return new THREE.Line(geometry, gridLineMaterial);
    }
    const gridGroup = new THREE.Group();
    const gridLineY = makeBaseLine(c(0), c(0), c(0), c(1));
    const gridLineX = makeBaseLine(c(0), c(0), c(1), c(0));

    for (let currXT = 0; currXT <= 1; currXT += stepX) {
      gridGroup.add(gridLineY.clone().translateX(currXT * 2));
    }
    for (let currYT = 0; currYT <= 1; currYT += stepY) {
      gridGroup.add(gridLineX.clone().translateY(currYT * 2));
    }
    return gridGroup;
  }

  private getOhlcRangeStep(ohlc: TChartCandle[]) {
    const price = { min: +Infinity, max: -Infinity, step: 10 };
    const time = {
      min: +Infinity,
      max: -Infinity,
      step: 5,
      count: ohlc.length,
    };
    ohlc.forEach(c => {
      if (c.h > price.max) price.max = c.h;
      if (c.l < price.min) price.min = c.l;

      if (typeof c.t !== 'number') throw new Error('Boo!');
      if (c.t > time.max) time.max = c.t;
      if (c.t < time.min) time.min = c.t;
    });
    price.min = Math.floor(price.min / 10) * 10;
    price.max = Math.ceil(price.max / 10) * 10;
    console.log('scale | price', price);
    console.log('scale | time', time);
    return { price, time };
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  // addCandlestickSeries() {
  //   return new CandlestickSeries(this.chart);
  // }
}

function c(n: number) {
  return (n - 0.5) * 2;
}

// class CandlestickSeries {
//   candlestick: LWC.ISeriesApi<'Candlestick'>;

//   constructor(chart: LWC.IChartApi) {
//     this.candlestick = chart.addCandlestickSeries({
//       upColor: COLOR.buy,
//       downColor: COLOR.sell,
//       borderDownColor: COLOR.sell,
//       borderUpColor: COLOR.buy,
//       wickDownColor: COLOR.sell,
//       wickUpColor: COLOR.buy,
//     });
//   }

//   setData(candlesData: TCandle[]) {
//     this.candlestick.setData(this.convertData(candlesData));
//   }

//   private convertData(candlesData: TCandle[]): LWC.BarData[] {
//     // @ts-ignore
//     return candlesData.map(({ timestamp, open, close, low, high }) => ({
//       time: timestamp,
//       open,
//       close,
//       low,
//       high,
//     }));
//   }
// }

export const mult = (a: number, b: number) => a * b;

export * from './types';

class Test {
  constructor() {
    console.log('making test...');
  }

  setOhlc() {
    console.log('setting ohld...');
  }
}
export default Test;

export function createChart(
  element: HTMLDivElement,
  colorConfig: Partial<TColorConfig> = {}
) {
  return new ChartOld(element, colorConfig);
}
