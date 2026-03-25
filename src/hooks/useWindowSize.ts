import { useState, useEffect } from 'react';

interface WindowSize {
  screenWidth: number;
  screenHeight: number;
  isMobile: boolean;
}

const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    screenWidth: 0,
    screenHeight: 0,
    isMobile: false,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        isMobile: window.innerWidth <= 992, // Define mobile as width <= 768px
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
