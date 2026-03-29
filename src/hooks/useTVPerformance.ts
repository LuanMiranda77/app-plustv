import { useEffect, useState } from "react";

// utils/tvOptimization.ts
export const tvOptimization = {
  // Debounce para eventos de controle remoto
  remoteDebounceMs: 100,

  // Limite de itens por carousel
  maxCarouselItems: 20,

  // Delay para scroll
  scrollDelayMs: 50,

  // Usar requestIdleCallback para carregamentos pesados
  useIdleCallback: true,

  // Desativar animações em TVs mais lentas
  reduceAnimations: true,

  // Limite de qualidade de imagem
  imageQuality: 'low' as const
};

// Hook para detectar performance da TV
export const useTVPerformance = () => {
  const [isSlowTV, setIsSlowTV] = useState(false);

  useEffect(() => {
    // Detectar se é uma TV com baixa performance
    const checkPerformance = () => {
      const memory = (performance as any).memory;
      if (memory && memory.jsHeapSizeLimit < 500 * 1024 * 1024) {
        setIsSlowTV(true);
      }

      // Teste de frame rate
      let frameCount = 0;
      let lastTime = performance.now();

      const checkFrameRate = () => {
        frameCount++;
        const now = performance.now();
        if (now - lastTime >= 1000) {
          const fps = frameCount;
          if (fps < 30) {
            setIsSlowTV(true);
          }
          frameCount = 0;
          lastTime = now;
        }
        requestAnimationFrame(checkFrameRate);
      };

      requestAnimationFrame(checkFrameRate);
    };

    checkPerformance();
  }, []);

  return { isSlowTV };
};
