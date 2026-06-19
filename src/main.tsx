import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Gracefully catch and suppress expected benign HMR/Vite websocket connection errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (
      reason &&
      (reason.message?.includes('WebSocket') ||
       reason.message?.includes('vite') ||
       reason.toString?.().includes('WebSocket') ||
       reason.toString?.().includes('websocket'))
    ) {
      event.preventDefault(); // Suppress noisy unhandled rejection errors
    }
  });

  window.addEventListener('error', (event) => {
    if (
      event.message?.includes('WebSocket') ||
      event.message?.includes('vite')
    ) {
      event.preventDefault(); // Suppress noisy websocket connection logs
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

