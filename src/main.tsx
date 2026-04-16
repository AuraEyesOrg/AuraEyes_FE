import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { DevCacheGuard } from './components/ui/dev-cache-guard';
import { installToastDeduplication } from './lib/toast-dedupe';
import './index.css';

installToastDeduplication();

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <DevCacheGuard />
    <App />
  </React.StrictMode>
);
