/* eslint-disable react-refresh/only-export-components */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import Layout from './components/layout/index.tsx';
import './index.css';
import { FocusProvider } from './Context/FocusContext.tsx';
import { DetailProvider } from './Context/DetailContext.tsx';

const isFileProtocol = window.location.protocol === 'file:';

const Router = isFileProtocol ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <DetailProvider>
        <FocusProvider>
          <Layout />
        </FocusProvider>
      </DetailProvider>
    </Router>
  </StrictMode>
);
