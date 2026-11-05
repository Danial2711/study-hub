import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'katex/dist/katex.min.css';
import './styles.css';
import { App } from './platform/App';
import { initSync } from './platform/state/store';
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });
initSync();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
