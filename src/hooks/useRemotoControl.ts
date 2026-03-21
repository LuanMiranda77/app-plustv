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
  onRed?: () => void;
  onGreen?: () => void;
  onBlue?: () => void;
};

export function useRemoteControl(handlers: RemoteKeys, disabled = false) {
  const handlersRef = useRef(handlers);
  const disabledRef = useRef(disabled);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const current = handlersRef.current;

    // When disabled, only allow Back (ESC/461) and OK (Enter/13) to escape
    if (disabledRef.current) {
      if (e.keyCode === 461 || e.keyCode === 27) {
        current.onBack?.();
        e.preventDefault();
      } else if (e.keyCode === 13 || e.keyCode === 44) {
        current.onOk?.();
        e.preventDefault();
      }
      return;
    }

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
      case 405:
        current.onYellow?.();
        e.preventDefault();
        break;
      case 403:
        current.onRed?.();
        e.preventDefault();
        break;
      case 404:
        current.onGreen?.();
        e.preventDefault();
        break;
      case 406:
        current.onBlue?.();
        e.preventDefault();
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
