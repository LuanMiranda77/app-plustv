import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import App from '../../App';
import { Splash } from '../../pages/Splash';
import { useAuthStore } from '../../store/authStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useWatchHistoryStore } from '../../store/watchHistoryStore';
import MainHeader from './MainHeader';
import { DEV_MODE } from '../../config/devMode';

const Layout: React.FC = () => {
  const [showSplash, setShowSplash] = useState(!DEV_MODE);
  const { loadFromStorage, activeProfile } = useAuthStore();
  const { loadFromStorage: loadFavoritesFromStorage, setCurrentProfile: setFavoritesProfile } =
    useFavoritesStore();
  const { loadFromStorage: loadHistoryFromStorage, setCurrentProfile: setHistoryProfile } =
    useWatchHistoryStore();
  const location = useLocation();

  // Rotas onde MainHeader não deve aparecer
  const hiddenHeaderRoutes = ['/', '/profiles', '/player', '/detail-series', '/detail-movie'];
  const shouldShowHeader = !hiddenHeaderRoutes.includes(location.pathname);

  // Carregar dados ao iniciar
  useEffect(() => {
    loadFromStorage();
    loadFavoritesFromStorage();
    loadHistoryFromStorage();
  }, []);

  // Quando activeProfile muda, carregar dados específicos do perfil
  useEffect(() => {
    if (activeProfile?.id) {
      setFavoritesProfile(activeProfile.id);
      setHistoryProfile(activeProfile.id);
    }
  }, [activeProfile?.id, setFavoritesProfile, setHistoryProfile]);

  const handleSplashFinish = useCallback(() => setShowSplash(false), []);

  return (
    <Fragment>
      {showSplash  && <Splash onFinish={handleSplashFinish} />}
      {shouldShowHeader && !showSplash && <MainHeader scrolling={false} />}
      {!showSplash &&
      <App />}
    </Fragment>
  );
};

export default Layout;
