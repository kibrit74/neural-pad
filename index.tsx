import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';

// Diagnostics: Detect any usage of deprecated ScriptProcessorNode
if (typeof window !== 'undefined') {
  try {
    const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (AC && AC.prototype && typeof AC.prototype.createScriptProcessor === 'function') {
      const originalCreateScriptProcessor = AC.prototype.createScriptProcessor;
      AC.prototype.createScriptProcessor = function (...args: any[]) {
        try {
          console.warn('[Diagnostics] createScriptProcessor invoked. Caller stack:', new Error().stack);
        } catch {}
        return originalCreateScriptProcessor.apply(this, args);
      };
    }
  } catch {}
}

const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <ThemeProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}
