import { useCallback, useEffect, useRef } from 'react';

type RemoteKeys = {
  onUp?: () => void;
  onDown?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  onOk?: () => void;
  onBack?: () => void;
  onPlayPause?: () => void;
  onYellow?: () => void;
};

export function useRemoteControl(handlers: RemoteKeys) {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const current = handlersRef.current;
    switch (e.keyCode) {
      case 38:
        current.onUp?.();
        e.preventDefault();
        break;
      case 40:
        current.onDown?.();
        e.preventDefault();
        break;
      case 37:
        current.onLeft?.();
        e.preventDefault();
        break;
      case 39:
        current.onRight?.();
        e.preventDefault();
        break;
      case 13:
      case 44:
        current.onOk?.();
        e.preventDefault();
        break;
      case 461:
      case 27:
        current.onBack?.();
        e.preventDefault();
        break;
      case 415:
      case 19:
        current.onPlayPause?.();
        e.preventDefault();
        break;
      case 403:
        current.onYellow?.();
        e.preventDefault();
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
