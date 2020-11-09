import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { init } from '../dist';
import { OHLC } from './data';

const App = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Chart />
    </div>
  );
};

const Chart = () => {
  const canvasRef = React.useRef<any>();

  React.useEffect(() => {
    if (canvasRef.current) {
      init(canvasRef.current, OHLC);
    }
  }, [canvasRef.current]);

  return (
    <canvas
      ref={canvasRef}
      id="webgl-canvas"
      width="640"
      height="480"
      style={{ borderRadius: '10px' }}
    >
      no canvas
    </canvas>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
