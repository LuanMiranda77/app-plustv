import { useEffect } from 'react';

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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log(e.keyCode);
      switch (e.keyCode) {
        case 38:
          handlers.onUp?.();
          break;
        case 40:
          handlers.onDown?.();
          break;
        case 37:
          handlers.onLeft?.();
          break;
        case 39:
          handlers.onRight?.();
          break;
        case 13:
        case 44:
          handlers.onOk?.();
          break;
        case 461:
        case 27:
          handlers.onBack?.();
          break;
        case 415:
        case 19:
          handlers.onPlayPause?.();
          break;
        case 405:
          handlers.onPlayPause?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
