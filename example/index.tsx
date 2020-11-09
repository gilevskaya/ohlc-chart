import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { sum } from '../dist';

const App = () => {
  return <div>{sum(1, 2)}</div>;
};

ReactDOM.render(<App />, document.getElementById('root'));
