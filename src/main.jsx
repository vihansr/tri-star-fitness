import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { GameStateProvider } from './context/GameStateContext.jsx';
import '../style.css';

// NOTE: no <React.StrictMode> — intentional. StrictMode double-invokes effects,
// which would mount/unmount the Three.js and D3 controllers twice and fight
// over their imperative DOM/canvas setup.
createRoot(document.getElementById('root')).render(
  <GameStateProvider>
    <App />
  </GameStateProvider>
);
