import { Capacitor } from '@capacitor/core';
import { useEffect, useState } from 'react';

interface WindowSize {
  screenWidth: number;
  screenHeight: number;
  isMobile: boolean;
}

const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    screenWidth: 0,
    screenHeight: 0,
    isMobile: false
  });

  useEffect(() => {
    const handleResize = () => {
      const hasTouch = navigator.maxTouchPoints > 0;
      const isTV = /TV|television|SmartTV|smart-tv/i.test(navigator.userAgent);
      // Em APK nativo (Capacitor), maxTouchPoints pode ser 0 — usa isNativePlatform como fallback
      const isNative = Capacitor.isNativePlatform();
      setWindowSize({
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        isMobile: window.innerWidth <= 992 && !isTV && (hasTouch || isNative)
      });
    };

    // Adiciona o event listener
    window.addEventListener('resize', handleResize);

    // Chama o handler imediatamente para pegar o tamanho inicial da tela
    handleResize();

    // Remove o event listener quando o componente é desmontado
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

export default useWindowSize;
