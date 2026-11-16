import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/anton/400.css';
import '@fontsource/archivo/400.css';
import '@fontsource/archivo/500.css';
import '@fontsource/archivo/700.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import '@/styles/tokens.css';
import '@/styles/base.css';
import { App } from '@/app/App';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Élément #root introuvable dans index.html');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
