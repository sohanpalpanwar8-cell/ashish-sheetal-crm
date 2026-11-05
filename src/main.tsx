import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './services/firebase.ts';

// Register Service Worker for Offline PWA Support and Chromium Installability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('PWA Service Worker registered:', reg.scope);
      })
      .catch((err) => {
        console.warn('PWA Service Worker registration failed:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);

