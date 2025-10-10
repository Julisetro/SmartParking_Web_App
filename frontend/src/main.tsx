import React from 'react';
import ReactDom from 'react-dom/client';
import { AppRouter } from './core/routing/AppRouter';
import './index.css';

ReactDom.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
