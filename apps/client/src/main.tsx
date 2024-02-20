import {App} from './App';
import {createRoot} from 'react-dom/client';
import React from 'react';
import ReactDOM from 'react-dom';

const container = document.getElementById('root');
const root = createRoot(container!);

if (process.env.NODE_ENV !== 'production') {
  // Not For Production
  import('@axe-core/react').then(axe => {
    axe.default(React, ReactDOM, 1000);
    root.render(<App />);
  });
} else{
  // For Production
  root.render(<App />);
}
