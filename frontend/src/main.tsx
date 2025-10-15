import React from 'react';
import ReactDom from 'react-dom/client';
import { AppRouter } from './core/routing/AppRouter';
import { AuthProvider } from './features/auth/context/AuthProvider';
import './index.css';

ReactDom.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </React.StrictMode>
);
