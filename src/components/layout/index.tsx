/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import App from '../../App';
import { Splash } from '../../pages/Splash';
import { useAuthStore } from '../../store/authStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useWatchHistoryStore } from '../../store/watchHistoryStore';
import MainHeader from './MainHeader';
import { DEV_MODE } from '../../config/devMode';
import { useContentStore } from '../../store/contentStore';
import ToastLoading from '../UI/ToastLoading';
import { StatusBar } from '@capacitor/status-bar';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { storage } from '../../utils/storage';
import moment from 'moment';
import ExpiredTrialModal from '../UI/ExpiredTrialModal';
import useWindowSize from '../../hooks/useWindowSize';

const Layout: React.FC = () => {
  const { serverConfig } = useAuthStore();
  const { fetchServerContent, isLoading } = useContentStore();
  const [showSplash, setShowSplash] = useState(!DEV_MODE);
  const { loadFromStorage, activeProfile } = useAuthStore();
  const { loadFromStorage: loadFavoritesFromStorage, setCurrentProfile: setFavoritesProfile } =
    useFavoritesStore();
  const { loadFromStorage: loadHistoryFromStorage, setCurrentProfile: setHistoryProfile } =
    useWatchHistoryStore();
  const location = useLocation();
  const [isTest, setIsTest] = useState(false);
  const [isTestEspired, setIsTestExpired] = useState(false);
  const { isMobile } = useWindowSize();

  // Rotas onde MainHeader não deve aparecer
  const hiddenHeaderRoutes = ['/login', '/profiles', '/player', '/detail-series', '/detail-movie'];
  const shouldShowHeader = !hiddenHeaderRoutes.includes(location.pathname);
  const closeBar = async () => {
    await StatusBar.hide();
  };

  // Carregar dados ao iniciar
  useEffect(() => {
    loadFromStorage();
    loadFavoritesFromStorage();
    isMobile && closeBar();
    loadHistoryFromStorage();
    if (serverConfig) {
      fetchServerContent(serverConfig);
    }
  }, []);

  // Quando activeProfile muda, carregar dados específicos do perfil
  useEffect(() => {
    if (activeProfile?.id) {
      setFavoritesProfile(activeProfile.id, serverConfig!);
      setHistoryProfile(activeProfile.id, serverConfig!);
    }
  }, [activeProfile?.id, setFavoritesProfile, setHistoryProfile]);

  useEffect(() => {
    let active = true;
    const dateTest = storage.get('perid-teste');
    const adultUnlocked = storage.get('adult-unlocked');
    if(!adultUnlocked) {
      storage.set('adult-unlocked', false);
    }
    if (dateTest) {
      if (moment(dateTest).diff(moment(), 'days') > 7) {
        setIsTestExpired(true);
      }
    } else {
      storage.set('perid-teste', new Date());
    }

    const setOrientation = async () => {
      if (!active) return;

      const portraitRoutes = ['/login'];

      if (portraitRoutes.includes(location.pathname)) {
        await ScreenOrientation.lock({ orientation: 'portrait' });
      } else {
        await ScreenOrientation.lock({ orientation: 'landscape' });
      }
    };

    isMobile && setOrientation();

    return () => {
      active = false;
    };
  }, [location.pathname]);

  const handleSplashFinish = useCallback(() => setShowSplash(false), []);
  if (isTest && isTestEspired) {
    return <ExpiredTrialModal isOpen={isTestEspired} onRenew={()=>{}} onLogout={()=>{}} />;
  }

  return (
    <Fragment>
      {showSplash && <Splash onFinish={handleSplashFinish} />}
      {<ToastLoading isLoading={isLoading} message="Carregando..." />}
      {shouldShowHeader && !showSplash && <MainHeader scrolling={false} />}
      {!showSplash && <App />}
    </Fragment>
  );
};

export default Layout;
