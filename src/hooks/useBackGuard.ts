import { useCallback, useEffect, useRef } from 'react';

/**
 * Intercepta o botão voltar nativo do navegador/TV (popstate).
 *
 * Quando `active` é true, empurra um estado extra no history.
 * Ao detectar popstate, chama `onBack` em vez de navegar para trás.
 */
export function useBackGuard(active: boolean, onBack: () => void) {
  const onBackRef = useRef(onBack);
  useEffect(() => {
    onBackRef.current = onBack;
  }, [onBack]);

  const stableOnBack = useCallback(() => onBackRef.current(), []);

  useEffect(() => {
    if (active) {
      window.history.pushState({ backGuard: true }, '');
    }
  }, [active]);

  useEffect(() => {
    if (!active) return;

    const handlePopState = () => {
      stableOnBack();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [active, stableOnBack]);
}
