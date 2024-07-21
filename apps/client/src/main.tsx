import {App} from './App';
import {createRoot} from 'react-dom/client';
import {defineCustomElements} from '@ionic/pwa-elements/loader';
import React from 'react';

defineCustomElements(window);

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(<App />);

/*
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
*/
