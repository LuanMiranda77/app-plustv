/* eslint-disable react-refresh/only-export-components */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import Layout from './components/layout/index.tsx';
import './index.css';
import { FocusProvider } from './Context/FocusContext.tsx';

const isFileProtocol = window.location.protocol === 'file:';

const Router = isFileProtocol ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <FocusProvider>
        <Layout />
      </FocusProvider>
    </Router>
  </StrictMode>
);
