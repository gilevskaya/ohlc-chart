import * as THREE from 'three';

export type TCandle = {
  timestamp: number | string;
  open: number;
  high: number;
  low: number;
  close: number;
};

type TCandleParts = {
  body: { buy: THREE.Mesh; sell: THREE.Mesh };
  bodyFlat: { buy: THREE.Line; sell: THREE.Line };
  wick: { buy: THREE.Line; sell: THREE.Line };
};

type TScale = {
  price: { min: number; max: number; step: number };
  time: { min: number; max: number; step: number; count: number };
};

export const COLOR = {
  bg: "#141414",
  grid: "#252525", // 0x1d1d1d | 010101 | 0x393939
  text: "#adadad",
  buy: "#22833d",
  sell:  "#b82e40",
}

export function init(canvas: HTMLCanvasElement, candlesData: TCandle[]) {
  const { height, width } = canvas;
  const scale = getOhlcRangeStep(candlesData);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  renderer.setClearColor(COLOR.bg, 1.0);

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000);
  camera.position.z = 1;

  const scene = new THREE.Scene();
  const sceneScale: [number, number, number] = [0.6, 0.8, 1];

  const grid = makeGrid(scale);
  grid.scale.set(...sceneScale);
  grid.position.setZ(-1);
  scene.add(grid);

  const candleParts = getCandleParts();
  const candlesGroup = new THREE.Group();
  const candles: THREE.Group[] = [];
  candlesData.forEach((cd: TCandle) => {
    candles.push(makeCandle(candleParts, cd, scale));
  });
  candles.forEach(c => candlesGroup.add(c));
  candlesGroup.scale.set(...sceneScale);
  scene.add(candlesGroup);

  //////
  renderer.render(scene, camera);
}

/////////////////////
// helper functions
/////////////////////
function getCandleParts(): TCandleParts {
  const material = {
    mesh: {
      buy: new THREE.MeshBasicMaterial({ color: COLOR.buy }),
      sell: new THREE.MeshBasicMaterial({ color: COLOR.sell }),
    },
    line: {
      buy: new THREE.LineBasicMaterial({ color: COLOR.buy, linewidth: 2 }),
      sell: new THREE.LineBasicMaterial({ color: COLOR.sell, linewidth: 2 }),
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
    const geometry = new THREE.BufferGeometry().setFromPoints(path.getPoints());
    return (material: THREE.LineBasicMaterial) =>
      new THREE.Line(geometry, material);
  })();

  const makeCandleWick = (() => {
    const path = new THREE.Path();
    path.setFromPoints([new THREE.Vector2(0, -1), new THREE.Vector2(0, 1)]);
    const geometry = new THREE.BufferGeometry().setFromPoints(path.getPoints());
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

function makeCandle(
  candleParts: TCandleParts,
  candleData: TCandle,
  { price, time }: TScale
): THREE.Group {
  const { body, bodyFlat, wick } = candleParts;
  const { timestamp, open, high, low, close } = candleData;
  const candleBody = (open > close ? body.sell : body.buy).clone();
  const candleBodyFlat = (open > close ? bodyFlat.sell : bodyFlat.buy).clone();
  const candleWick = (open > close ? wick.sell : wick.buy).clone();
  const candleGroup = new THREE.Group();

  const bodyH = Math.abs(open - close) / (price.max - price.min);
  const wickH = Math.abs(low - high) / (price.max - price.min);

  if (typeof timestamp !== "number") throw new Error('Boo!')
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

function makeGrid({ time, price }: TScale) {
  const stepX = time.step / (time.max - time.min);
  const stepY = price.step / (price.max - price.min);

  const gridLineMaterial = new THREE.LineBasicMaterial({
    color: COLOR.grid,
    linewidth: 0.5,
  }); 

  function makeBaseLine(x1: number, y1: number, x2: number, y2: number) {
    const path = new THREE.Path();
    path.setFromPoints([new THREE.Vector2(x1, y1), new THREE.Vector2(x2, y2)]);
    const geometry = new THREE.BufferGeometry().setFromPoints(path.getPoints());
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

function c(n: number) {
  return (n - 0.5) * 2;
}

function getOhlcRangeStep(ohlc: TCandle[]) {
  const price = { min: +Infinity, max: -Infinity, step: 10 };
  const time = { min: +Infinity, max: -Infinity, step: 5, count: ohlc.length };
  ohlc.forEach(c => {
    if (c.high > price.max) price.max = c.high;
    if (c.low < price.min) price.min = c.low;
    
    if (typeof c.timestamp !== "number") throw new Error('Boo!')
    if (c.timestamp > time.max) time.max = c.timestamp;
    if (c.timestamp < time.min) time.min = c.timestamp;
  });
  price.min = Math.floor(price.min / 10) * 10;
  price.max = Math.ceil(price.max / 10) * 10;
  console.log('scale | price', price);
  console.log('scale | time', time);
  return { price, time };
}

export * as tview from './tview';