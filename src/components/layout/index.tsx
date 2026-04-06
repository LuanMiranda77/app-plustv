/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react-hooks/set-state-in-effect */
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { StatusBar } from '@capacitor/status-bar';
import moment from 'moment';
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import App from '../../App';
import { DEV_MODE } from '../../config/devMode';
import useWindowSize from '../../hooks/useWindowSize';
import { Splash } from '../../pages/Splash';
import { useAuthStore } from '../../store/authStore';
import { useChannelStore } from '../../store/contentStore';
import { useHomeStore } from '../../store/homeStore';
import { useWatchHistoryStore } from '../../store/watchHistoryStore';
import { storage } from '../../utils/storage';
import ExpiredTrialModal from '../UI/ExpiredTrialModal';
import ToastLoading from '../UI/ToastLoading';
import MainHeader from './MainHeader';

const Layout: React.FC = () => {
  const { serverConfig } = useAuthStore();
  // const { fetchServerContent, isLoading } = useContentStore();
  const { fetchLiveContent, isLoading } = useChannelStore();
  const [showSplash, setShowSplash] = useState(!DEV_MODE);
  const { loadFromStorage, activeProfile } = useAuthStore();
  const { loadFromStorage: loadHomeStorage } = useHomeStore();
  const { loadFromStorage: loadHistoryFromStorage, setCurrentProfile: setHistoryProfile } =
    useWatchHistoryStore();
  const location = useLocation();
  const [isTest, setIsTest] = useState(false);
  const [isTestEspired, setIsTestExpired] = useState(false);
  const { isMobile } = useWindowSize();
  const lastLoadedServerRef = useRef<string | null>(null);

  // Rotas onde MainHeader não deve aparecer
  const hiddenHeaderRoutes = ['/login', '/profiles', '/player', '/detail-series', '/detail-movie'];
  const shouldShowHeader = !hiddenHeaderRoutes.includes(location.pathname);
  const closeBar = async () => {
    await StatusBar.hide();
  };

  // Carregar dados ao iniciar
  useEffect(() => {
    if (isMobile) closeBar();
    loadFromStorage();
    loadHistoryFromStorage();
  }, [isMobile, loadHomeStorage, loadFromStorage, loadHistoryFromStorage]);

  useEffect(() => {
    if (serverConfig) {
      const serverKey = `${serverConfig.url}|${serverConfig.username}`;

      if (lastLoadedServerRef.current === serverKey) return;

      lastLoadedServerRef.current = serverKey;
      loadHomeStorage(serverConfig);
      fetchLiveContent(serverConfig);
    }
  }, [serverConfig, fetchLiveContent, loadHomeStorage]);

  // Quando activeProfile muda, carregar dados específicos do perfil
  useEffect(() => {
    if (activeProfile?.id) {
      setHistoryProfile(activeProfile.id, serverConfig!);
    }
  }, [activeProfile?.id, setHistoryProfile]);

  useEffect(() => {
    let active = true;
    const dateTest = storage.get('perid-teste');
    const adultUnlocked = storage.get('adult-unlocked');
    if (!adultUnlocked) {
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
    return <ExpiredTrialModal isOpen={isTestEspired} onRenew={() => {}} onLogout={() => {}} />;
  }

  return (
    <Fragment>
      {showSplash && <Splash onFinish={handleSplashFinish} />}
      {<ToastLoading isLoading={isLoading} message="Atualizando os canais...." />}
      {!showSplash && !isLoading && (
        <Fragment>
          {shouldShowHeader && <MainHeader scrolling={false} />}
          <App />
        </Fragment>
      )}
    </Fragment>
  );
};

export default Layout;
