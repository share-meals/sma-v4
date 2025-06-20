import {App} from './App';
import {createRoot} from 'react-dom/client';
import {defineCustomElements} from '@ionic/pwa-elements/loader';

defineCustomElements(window);

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(<App />);
